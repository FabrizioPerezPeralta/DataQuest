@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM M2_HOME - location of maven2's installed home dir
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a keystroke before ending
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@IF "%MAVEN_SKIP_RC%" == "" @SETLOCAL
@SET MAVEN_SKIP_RC=FALSE

@IF NOT "%JAVA_HOME%" == "" GOTO :JavaHomeFound
:JavaHomeNotFound
@ECHO JAVA_HOME not set. Please set JAVA_HOME to your JDK installation directory.
@ECHO Example:
@ECHO   set JAVA_HOME=C:\Program Files\Java\jdk-21
@ECHO.
@ECHO Checking for Java in PATH...
@WHERE java >nul 2>nul
@IF %ERRORLEVEL% NEQ 0 (
    @ECHO Java not found in PATH either.
    @ECHO Please install JDK 21 from https://adoptium.net/
    @EXIT /B 1
)
@FOR /F "tokens=*" %%i IN ('where java') DO @SET JAVA_EXEC=%%i
@FOR /F "tokens=*" %%i IN ('"%~dp0mvnw" --version 2^>nul ^| find "Apache Maven"') DO @SET HAS_MAVEN=1
@IF DEFINED HAS_MAVEN GOTO :RunMaven
@ECHO Maven not found, downloading Maven wrapper...
@GOTO :DownloadMaven

:JavaHomeFound
@SET JAVA_EXEC=%JAVA_HOME%\bin\java.exe

:DownloadMaven
@SET MAVEN_VERSION=3.9.6
@SET MAVEN_URL=https://archive.apache.org/dist/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip
@SET MAVEN_ZIP=%TEMP%\maven-%MAVEN_VERSION%.zip
@SET MAVEN_HOME=%USERPROFILE%\.m2\wrapper\apache-maven-%MAVEN_VERSION%

@IF NOT EXIST "%MAVEN_HOME%\bin\mvn.cmd" (
    @ECHO Downloading Maven %MAVEN_VERSION% from %MAVEN_URL%...
    @powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%MAVEN_ZIP%'}"
    @IF %ERRORLEVEL% NEQ 0 (
        @ECHO Failed to download Maven. Please install Maven manually from https://maven.apache.org/download.cgi
        @EXIT /B 1
    )
    @powershell -Command "& {Expand-Archive '%MAVEN_ZIP%' -DestinationPath '%USERPROFILE%\.m2\wrapper\' -Force}"
    @DEL /Q "%MAVEN_ZIP%"
)

:RunMaven
@SET MAVEN_CMD="%MAVEN_HOME%\bin\mvn.cmd"
@IF NOT EXIST %MAVEN_CMD% (
    @ECHO Maven executable not found at %MAVEN_CMD%
    @ECHO Try installing Maven manually from https://maven.apache.org/download.cgi
    @EXIT /B 1
)

@SET MAVEN_OPTS=%MAVEN_OPTS% -Dmaven.wrapper.http.timeout=120000
@"%JAVA_EXEC%" %MAVEN_OPTS% -classpath "%MAVEN_HOME%\boot\plexus-classworlds-*.jar" "-Dclassworlds.conf=%MAVEN_HOME%\bin\m2.conf" "-Dmaven.home=%MAVEN_HOME%" org.codehaus.plexus.classworlds.launcher.Launcher %*
@EXIT /B %ERRORLEVEL%
