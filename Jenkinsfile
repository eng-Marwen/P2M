
pipeline {
    agent {
        node {
            label ''
            retries 2
        }
    }

    stages {
        stage('Test Connection') {
            steps {
                echo 'Jenkins CI/CD Pipeline Started!'
            }
        }

        stage('Checkout') {
            steps {
                echo "Repository: P2M"
                echo "Build Number: ${env.BUILD_NUMBER}"
                echo "Workspace: ${env.WORKSPACE}"
            }
        }

        stage('Test Build') {
            steps {
                sh '''
                    echo "Testing Jenkins environment..."
                    git --version
                    docker --version
                    echo "Environment test completed!"
                '''
            }
        }

        stage('Success') {
            steps {
                echo 'Pipeline executed successfully!'
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline finished successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs.'
        }
    }
}
