#!/bin/sh
# ----------------------------------------------------------------------------
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# ----------------------------------------------------------------------------

MAVEN_VERSION=3.9.6
MAVEN_URL="https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.zip"
MAVEN_HOME="${HOME}/.m2/wrapper/apache-maven-${MAVEN_VERSION}"

if [ ! -f "${MAVEN_HOME}/bin/mvn" ]; then
    echo "Downloading Maven ${MAVEN_VERSION}..."
    mkdir -p "${HOME}/.m2/wrapper"
    curl -fsSL "${MAVEN_URL}" -o /tmp/maven.zip
    unzip -q /tmp/maven.zip -d "${HOME}/.m2/wrapper/"
    rm /tmp/maven.zip
fi

exec "${MAVEN_HOME}/bin/mvn" "$@"
