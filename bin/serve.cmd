@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\serve" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\serve" %*
)
