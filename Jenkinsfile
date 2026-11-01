
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        TEST_IMAGE = "jenkins-smoke-test:${BUILD_NUMBER}"
    }

    stages {

        stage('Environment Check') {
            steps {
                sh '''
                    echo "=== Jenkins Environment ==="
                    whoami
                    java -version
                    git --version
                    docker version
                    docker buildx version
                '''
            }
        }

        stage('Prepare Test Files') {
            steps {
                sh '''
                    mkdir -p test-node test-python

                    # Node.js / Jest project
                    cat > test-node/package.json <<'EOF'
{
  "name": "jenkins-node-test",
  "version": "1.0.0",
  "scripts": {
    "test": "jest --runInBand"
  },
  "devDependencies": {
    "jest": "^30.0.0"
  }
}
EOF

                    cat > test-node/math.js <<'EOF'
function add(a, b) {
    return a + b;
}
module.exports = add;
EOF

                    cat > test-node/math.test.js <<'EOF'
const add = require('./math');

test('2 + 3 = 5', () => {
    expect(add(2, 3)).toBe(5);
});
EOF

                    # Python / pytest project
                    cat > test-python/test_math.py <<'EOF'
def test_addition():
    assert 2 + 3 == 5

def test_multiplication():
    assert 3 * 4 == 12
EOF

                    cat > Dockerfile <<'EOF'
FROM alpine:3.20
CMD ["echo", "Docker image built and executed successfully!"]
EOF
                '''
            }
        }

        stage('TypeScript / Jest Tests') {
            steps {
                sh '''
                    docker run --rm \
                      -v "$WORKSPACE/test-node:/app" \
                      -w /app \
                      node:22-bookworm \
                      bash -c "npm install --no-audit --no-fund && npm test"
                '''
            }
        }

        stage('Python / Pytest') {
            steps {
                sh '''
                    docker run --rm \
                      -v "$WORKSPACE/test-python:/app" \
                      -w /app \
                      python:3.12-slim \
                      bash -c "pip install --no-cache-dir pytest && pytest -v"
                '''
            }
        }

        stage('Docker Image Build') {
            steps {
                sh '''
                    docker build -t "$TEST_IMAGE" .
                '''
            }
        }

        stage('Run Docker Image') {
            steps {
                sh '''
                    docker run --rm "$TEST_IMAGE"
                '''
            }
        }
    }

    post {
        always {
            sh '''
                docker image rm "$TEST_IMAGE" 2>/dev/null || true
            '''
            echo 'Pipeline execution finished.'
        }

        success {
            echo 'ALL CI TESTS PASSED!'
        }

        failure {
            echo 'CI PIPELINE FAILED!'
        }
    }
}
