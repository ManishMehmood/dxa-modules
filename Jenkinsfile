// Dynamic Documentation GUI build pipeline
// Allocation of node for execution of build steps
pipeline {

    agent {
        label 'dxadocker'
    }

    stages {
        stage('Building DD GUI') {
            steps {
                dir("gui") {
                    powershell 'mvn clean install'
                }
            }
        }
    }

    post {
        always {
            dir("gui") {
                archiveArtifacts artifacts: 'target/gui/**', fingerprint: true
            }
        }
    }
}

