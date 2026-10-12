@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET "MVN_CMD=mvn.cmd") ELSE (SET "MVN_CMD=%__MVNW_ARG0_NAME__%")

@SET MAVEN_PROJECTBASEDIR=%~dp0
@IF NOT "%MAVEN_BASEDIR%"=="" SET "MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%"

@SET MVNW_REPOURL=https://repo.maven.apache.org/maven2
@SET MVNW_DISTRIBUTION_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip

@SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

@SET DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar

@IF NOT EXIST %WRAPPER_JAR% (
    @ECHO Downloading Maven Wrapper...
    @powershell -Command "Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%WRAPPER_JAR%' -UseBasicParsing"
)

@SET JAVA_EXE=java
@IF NOT "%JAVA_HOME%"=="" SET "JAVA_EXE=%JAVA_HOME%\bin\java.exe"

@IF NOT EXIST "%JAVA_EXE%" (
    @FOR /f "tokens=*" %%i IN ('where java 2^>nul') DO (
        @SET "JAVA_EXE=%%i"
        @goto :found_java
    )
    :found_java
)

@"%JAVA_EXE%" -classpath %WRAPPER_JAR% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %*
