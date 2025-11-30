import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const isWindows = os.platform() === 'win32';
const projectRoot = path.resolve('..');

// Find jac executable and python - check virtual environment first
function findExecutables() {
  const venvDirs = ['venv', '.venv', 'env'];
  const binDir = isWindows ? 'Scripts' : 'bin';
  
  let jacPath = null;
  let pythonPath = null;
  
  for (const venv of venvDirs) {
    const jacExe = path.join(projectRoot, venv, binDir, isWindows ? 'jac.exe' : 'jac');
    const pythonExe = path.join(projectRoot, venv, binDir, isWindows ? 'python.exe' : 'python');
    
    if (!jacPath && fs.existsSync(jacExe)) {
      jacPath = jacExe;
      console.log(`[jac-runner] Found jac: ${jacPath}`);
    }
    if (!pythonPath && fs.existsSync(pythonExe)) {
      pythonPath = pythonExe;
      console.log(`[jac-runner] Found python: ${pythonPath}`);
    }
  }
  
  return { jacPath, pythonPath };
}

const { jacPath, pythonPath } = findExecutables();

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'jac-runner',
      configureServer(server) {
        server.middlewares.use('/api/run-jac', async (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { code } = JSON.parse(body);
                
                // Create temp file with the Jac code
                const tempDir = os.tmpdir();
                const tempFile = path.join(tempDir, `jac_temp_${Date.now()}.jac`);
                
                // Smart code wrapping - only wrap simple statements, not definitions
                let wrappedCode = code.trim();
                
                // Check if code has node, walker, edge, obj definitions or already has entry
                const hasDefinitions = /^\s*(node|walker|edge|obj|can|import|glob)\s+/m.test(code);
                const hasEntry = /with\s+(entry|`root\s+entry)/.test(code);
                const hasSpawn = /spawn\s+/.test(code);
                
                // Only wrap if it's simple code (no definitions and no entry point)
                if (!hasDefinitions && !hasEntry && !hasSpawn) {
                  wrappedCode = `with entry {\n${code}\n}`;
                } else if (hasDefinitions && !hasEntry && !hasSpawn) {
                  // Has definitions but no entry point - add a simple entry at the end
                  wrappedCode = `${code}\n\nwith entry {\n    print("Code executed successfully!");\n}`;
                }
                // Otherwise use code as-is
                
                fs.writeFileSync(tempFile, wrappedCode);
                
                // Run jac and capture output using spawn (more reliable on Windows)
                const backendPath = path.join(projectRoot, 'backend');
                console.log(`[jac-runner] Temp file: ${tempFile}`);
                console.log(`[jac-runner] CWD: ${backendPath}`);
                console.log(`[jac-runner] Code:\n${wrappedCode}`);
                
                let cmd, args;
                if (jacPath) {
                  // Use jac directly from venv
                  cmd = jacPath;
                  args = ['run', tempFile];
                  console.log(`[jac-runner] Using jac: ${cmd} ${args.join(' ')}`);
                } else if (pythonPath) {
                  // Use python -m jaclang.cli
                  cmd = pythonPath;
                  args = ['-m', 'jaclang.cli', 'run', tempFile];
                  console.log(`[jac-runner] Using python: ${cmd} ${args.join(' ')}`);
                } else {
                  // Fallback to system jac
                  cmd = 'jac';
                  args = ['run', tempFile];
                  console.log(`[jac-runner] Using system jac`);
                }
                
                const proc = spawn(cmd, args, {
                  cwd: backendPath,
                  env: { ...process.env },
                  windowsHide: true
                });
                
                let stdout = '';
                let stderr = '';
                
                proc.stdout.on('data', (data) => {
                  stdout += data.toString();
                });
                
                proc.stderr.on('data', (data) => {
                  stderr += data.toString();
                });
                
                // Set timeout
                const timeout = setTimeout(() => {
                  proc.kill();
                  try { fs.unlinkSync(tempFile); } catch {}
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: 'Execution timed out (30s)' }));
                }, 30000);
                
                proc.on('close', (exitCode) => {
                  clearTimeout(timeout);
                  // Clean up temp file
                  try { fs.unlinkSync(tempFile); } catch {}
                  
                  console.log(`[jac-runner] Exit code: ${exitCode}`);
                  console.log(`[jac-runner] stdout: ${stdout}`);
                  console.log(`[jac-runner] stderr: ${stderr}`);
                  
                  if (exitCode !== 0) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ 
                      success: false, 
                      error: stderr || stdout || `Process exited with code ${exitCode}`
                    }));
                  } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ 
                      success: true, 
                      output: stdout.trim() || '(no output - code executed successfully)' 
                    }));
                  }
                });
                
                proc.on('error', (err) => {
                  clearTimeout(timeout);
                  try { fs.unlinkSync(tempFile); } catch {}
                  console.log(`[jac-runner] Process error: ${err.message}`);
                  
                  let errorMsg = err.message;
                  if (errorMsg.includes('ENOENT')) {
                    errorMsg = `Could not find jac executable.\nSearched: ${jacPath || pythonPath || 'system PATH'}\nMake sure jaclang is installed: pip install jaclang`;
                  }
                  
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: errorMsg }));
                });
              } catch (e) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
          } else {
            res.statusCode = 405;
            res.end('Method not allowed');
          }
        });
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      // jaclang 0.8+ API endpoints - only proxy actual API paths
      '/walker': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/healthz': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
