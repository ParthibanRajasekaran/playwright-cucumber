# 🎛️ Test Artifact Configuration Guide

## ❓ **Why Video Was Missing**

The video recording wasn't showing because:

1. **Cucumber vs Playwright**: Video recording needs to be enabled at the browser **context level**, not just in Playwright config
2. **Configuration Mismatch**: Our World class wasn't consistently applying video settings
3. **Context Options**: Video recording requires `recordVideo` in browser context options

**✅ Fixed by:**
- Ensuring video recording is enabled in browser context creation
- Adding proper artifact configuration management
- Making video generation conditional based on environment flags

---

## 🎛️ **Configurable Artifact Flags**

You can now control **screenshots**, **videos**, and **traces** via environment variables:

### 📸 **Screenshot Control**
```bash
# Disable screenshots
SCREENSHOTS=false npm test
NO_SCREENSHOTS=true npm test

# Force screenshots (even on passing tests)  
FORCE_SCREENSHOTS=true npm test
```

### 🎥 **Video Control**
```bash
# Disable videos
VIDEOS=false npm test
NO_VIDEOS=true npm test

# Force videos (even on passing tests)
FORCE_VIDEOS=true npm test
```

### 📊 **Trace Control**
```bash
# Disable traces
TRACES=false npm test
NO_TRACES=true npm test

# Force traces (even on passing tests)
FORCE_TRACES=true npm test
```

### 🎯 **Global Controls**
```bash
# Disable ALL artifacts
NO_ARTIFACTS=true npm test

# Generate artifacts for passing tests too
ARTIFACTS_ON_SUCCESS=true npm test

# Hide configuration display
SHOW_ARTIFACT_CONFIG=false npm test
```

---

## 📋 **Usage Examples**

### **Default (All artifacts on failure only):**
```bash
npm test
# Output: ✅ Screenshots ✅ Videos ✅ Traces (Failure Only)
```

### **No Videos (for faster execution):**
```bash
VIDEOS=false npm test  
# Output: ✅ Screenshots ❌ Videos ✅ Traces (Failure Only)
```

### **Only Screenshots (minimal artifacts):**
```bash
VIDEOS=false TRACES=false npm test
# Output: ✅ Screenshots ❌ Videos ❌ Traces (Failure Only)
```

### **No Artifacts (fastest execution):**
```bash
NO_ARTIFACTS=true npm test
# Output: ❌ Screenshots ❌ Videos ❌ Traces (Failure Only)
```

### **Full Debug Mode (artifacts on all tests):**
```bash
ARTIFACTS_ON_SUCCESS=true npm test
# Output: ✅ Screenshots ✅ Videos ✅ Traces (All Tests)
```

### **Custom Combinations:**
```bash
# Only videos for failures
SCREENSHOTS=false TRACES=false npm test

# Force videos, disable traces  
FORCE_VIDEOS=true TRACES=false npm test

# Minimal CI setup
NO_VIDEOS=true npm run test:ci
```

---

## 🎯 **Configuration Priority**

Environment variables are processed in this order:

1. **Global Disable**: `NO_ARTIFACTS=true` disables everything
2. **Specific Disable**: `SCREENSHOTS=false`, `VIDEOS=false`, `TRACES=false`
3. **Force Enable**: `FORCE_SCREENSHOTS=true`, `FORCE_VIDEOS=true`, `FORCE_TRACES=true`
4. **Success Mode**: `ARTIFACTS_ON_SUCCESS=true` generates for passing tests too

---

## 📊 **Configuration Display**

Each test run shows the current configuration:

```
🎛️  Test Artifact Configuration:
   📸 Screenshots: ✅ Enabled
   🎥 Videos: ❌ Disabled  
   📊 Traces: ✅ Enabled
   🎯 Mode: Failure Only
```

**Hide this display:**
```bash
SHOW_ARTIFACT_CONFIG=false npm test
```

---

## 🚀 **Performance Impact**

| Configuration | Speed | Debug Value | Use Case |
|--------------|--------|-------------|----------|
| `NO_ARTIFACTS=true` | ⚡ Fastest | ❌ Minimal | CI smoke tests |
| `VIDEOS=false` | 🏃 Fast | 📸 Medium | Local development |
| Default | 🚶 Moderate | 🎯 High | Test failures |
| `ARTIFACTS_ON_SUCCESS=true` | 🐌 Slowest | 🎭 Maximum | Deep debugging |

---

## 🛠️ **Integration Examples**

### **Package.json Scripts:**
```json
{
  "scripts": {
    "test": "cucumber-js --config=cucumber.config.js",
    "test:fast": "NO_VIDEOS=true npm run test",
    "test:minimal": "NO_ARTIFACTS=true npm run test", 
    "test:debug": "ARTIFACTS_ON_SUCCESS=true npm run test",
    "test:ci": "NO_VIDEOS=true npm run test"
  }
}
```

### **CI/CD Configuration:**
```yaml
# Fast CI tests
- name: Run Tests (Fast)
  run: NO_VIDEOS=true npm test

# Debug failing tests  
- name: Run Tests (Full Debug)
  if: failure()
  run: ARTIFACTS_ON_SUCCESS=true npm test
```

---

## 📝 **Implementation Details**

### **File Structure:**
- `src/config/artifacts.ts` - Configuration management
- `src/fixtures/world.ts` - Browser context setup with artifact controls
- `features/step-definitions/auth-steps.ts` - After hook with conditional attachments

### **Key Features:**
- ✅ **Conditional Browser Context**: Videos only recorded when enabled
- ✅ **Smart Cleanup**: Artifacts deleted for passing tests (unless forced)
- ✅ **Selective Attachments**: Only attach enabled artifact types to reports
- ✅ **Performance Optimized**: No unnecessary processing when disabled
- ✅ **Clear Feedback**: Configuration displayed and skip messages shown

The artifact configuration system provides **full control** over test execution performance vs debugging capability! 🎉