Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
folder = FSO.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = folder

WshShell.Run "cmd /c node server.js >> server.log 2>&1", 0, False
WScript.Sleep 2000

envPath = folder & "\permanent-link.env"
If FSO.FileExists(envPath) Then
  Set f = FSO.OpenTextFile(envPath, 1)
  txt = f.ReadAll
  f.Close
  hasToken = False
  hasDomain = False
  lines = Split(Replace(txt, vbCr, ""), vbLf)
  For Each line In lines
    line = Trim(line)
    If Left(line, 1) <> "#" Then
      If Left(line, 10) = "AUTHTOKEN=" And Len(Trim(Mid(line, 11))) > 0 Then hasToken = True
      If Left(line, 7) = "DOMAIN=" And Len(Trim(Mid(line, 8))) > 0 Then hasDomain = True
    End If
  Next
  If hasToken And hasDomain Then
    WshShell.Run "powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & folder & "\start-permanent-tunnel.ps1""", 0, False
  End If
End If
