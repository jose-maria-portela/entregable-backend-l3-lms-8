const scanner = require('sonarqube-scanner');
// Replace with your project name key and token and 
// use the command 'node ./sonarqube/sonarscan.js' 
// on the frontend folder to analyze
scanner(
    {
        serverUrl: 'https://oitilo.us.es/sonar',
        token: "e477b1e4303c9a294f08be3ebcf170f75f2a0001",
        options: {
            'sonar.projectName': 'DeliverUs-josporhue',
            'sonar.projectDescription': 'Here I can add a description of my project',
            'sonar.projectKey': 'DeliverUs-josporhue',
            'sonar.projectVersion': '0.0.1',
            'sonar.login': 'e477b1e4303c9a294f08be3ebcf170f75f2a0001',
            'sonar.exclusions': '',
            'sonar.sourceEncoding': 'UTF-8',
        }
    },
    () => process.exit()
)