@echo off
REM Start Jac backend server
set REQUIRE_AUTH_BY_DEFAULT=false
cd backend
jac serve main.jac

