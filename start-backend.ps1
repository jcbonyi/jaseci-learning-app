# Start Jac backend server
$env:REQUIRE_AUTH_BY_DEFAULT = "false"
Set-Location backend
jac serve main.jac

