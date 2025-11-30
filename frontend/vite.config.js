import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
                
                // Wrap code in a with entry block if not already wrapped
                let wrappedCode = code;
                if (!code.includes('with entry')) {
                  wrappedCode = `with entry {\n${code}\n}`;
                }
                
                fs.writeFileSync(tempFile, wrappedCode);
                
                // Run jac and capture output - use exec with shell:true for Windows compatibility
                exec(`jac run "${tempFile}"`, {
                  encoding: 'utf-8',
                  timeout: 15000, // 15 second timeout
                  cwd: path.resolve('./backend'),
                  shell: true,
                  windowsHide: true
                }, (error, stdout, stderr) => {
                  // Clean up temp file
                  try { fs.unlinkSync(tempFile); } catch {}
                  
                  if (error) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ 
                      success: false, 
                      error: stderr || stdout || error.message 
                    }));
                  } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ 
                      success: true, 
                      output: stdout.trim() || '(no output)' 
                    }));
                  }
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
