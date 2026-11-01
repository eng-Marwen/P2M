
pipeline {
    agent any

    stages {
        stage('Test Connection') {
            steps {
                echo '================================'
                echo ' Jenkins CI/CD Pipeline Started!'
                echo '================================'
            }
        }

        stage('Checkout') {
            steps {
                echo "Repository: P2M"
                echo "Branch: ${env.BRANCH_NAME ?: 'main'}"
                echo "Build Number: ${env.BUILD_NUMBER}"

                checkout scm
            }
        }

        stage('Test Build') {
            steps {
                sh '''
                    echo "Testing Jenkins environment..."
                    docker --version
                    git --version
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
