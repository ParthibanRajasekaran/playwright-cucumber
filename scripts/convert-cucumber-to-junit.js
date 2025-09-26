#!/usr/bin/env node

const fs = require('fs');
const _path = require('path'); // Utility for path operations

function convertCucumberToJunit(inputFile, outputFile) {
  try {
    // Read the cucumber JSON report
    const cucumberData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    // Convert to JUnit XML format
    const junit = generateJunitXml(cucumberData);
    
    // Write the JUnit XML file
    fs.writeFileSync(outputFile, junit);
    console.log(`✅ Converted ${inputFile} to ${outputFile}`);
  } catch (error) {
    console.error(`❌ Error converting file: ${error.message}`);
    process.exit(1);
  }
}

function generateJunitXml(cucumberData) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<testsuites>\n';
  
  let totalTests = 0;
  let totalFailures = 0;
  let totalTime = 0;
  
  cucumberData.forEach(feature => {
    const featureName = feature.name || 'Unknown Feature';
    const elements = feature.elements || [];
    
    elements.forEach(scenario => {
      if (scenario.type === 'scenario') {
        totalTests++;
        const scenarioName = scenario.name || 'Unknown Scenario';
        const steps = scenario.steps || [];
        
        let scenarioTime = 0;
        let scenarioFailed = false;
        let failureMessage = '';
        
        steps.forEach(step => {
          if (step.result) {
            scenarioTime += (step.result.duration || 0) / 1000000000; // Convert nanoseconds to seconds
            if (step.result.status === 'failed') {
              scenarioFailed = true;
              failureMessage = step.result.error_message || 'Step failed';
            }
          }
        });
        
        if (scenarioFailed) {
          totalFailures++;
        }
        totalTime += scenarioTime;
        
        xml += `  <testsuite name="${escapeXml(featureName)}" tests="1" failures="${scenarioFailed ? 1 : 0}" time="${scenarioTime.toFixed(3)}">\n`;
        xml += `    <testcase name="${escapeXml(scenarioName)}" classname="${escapeXml(featureName)}" time="${scenarioTime.toFixed(3)}">\n`;
        
        if (scenarioFailed) {
          xml += `      <failure message="Scenario failed">${escapeXml(failureMessage)}</failure>\n`;
        }
        
        xml += `    </testcase>\n`;
        xml += `  </testsuite>\n`;
      }
    });
  });
  
  xml += '</testsuites>\n';
  
  console.log(`📊 Summary: ${totalTests} tests, ${totalFailures} failures, ${totalTime.toFixed(3)}s total time`);
  
  return xml;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: node convert-cucumber-to-junit.js <input.json> <output.xml>');
    process.exit(1);
  }
  
  const [inputFile, outputFile] = args;
  convertCucumberToJunit(inputFile, outputFile);
}

module.exports = { convertCucumberToJunit };
