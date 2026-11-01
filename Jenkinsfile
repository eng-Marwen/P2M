pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    stages {
        stage('Connection Test') {
            steps {
                echo 'Jenkins CI/CD Pipeline Started!'
                echo "Build Number: ${env.BUILD_NUMBER}"
                echo "Workspace: ${env.WORKSPACE}"
            }
        }

        stage('Git Test') {
            steps {
                sh 'git --version'
            }
        }

        stage('Docker Test') {
            steps {
                sh '''
                    docker --version
                    docker ps
                '''
            }
        }

        stage('Docker Build Test') {
            steps {
                sh '''
                    mkdir -p docker-test

                    cat > docker-test/Dockerfile <<'EOF'
FROM alpine:latest
CMD ["echo", "Docker build from Jenkins works!"]
EOF

                    docker build -t jenkins-test:${BUILD_NUMBER} docker-test/
                    docker run --rm jenkins-test:${BUILD_NUMBER}
                '''
            }
        }

        stage('Storage Test') {
            steps {
                sh 'df -h /var/jenkins_home'
            }
        }
    }


    post {
        success {
            echo 'All Jenkins tests passed!'
        }
        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}