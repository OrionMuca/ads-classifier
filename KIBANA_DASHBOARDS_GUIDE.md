# 📊 Kibana Dashboards Implementation Guide

## Overview
This guide explains how to pre-select and automatically import Kibana dashboards from [elastic-content-share.eu](https://elastic-content-share.eu) when containers start up.

---

## 🎯 Recommended Dashboards from elastic-content-share.eu

### 1. Marketplace Analytics Dashboard
**Purpose:** Track overall marketplace performance
- Post views and engagement
- Category distribution
- Location-based insights
- User activity patterns

**Search Terms:** "marketplace", "e-commerce", "analytics"

### 2. Search Analytics Dashboard
**Purpose:** Monitor search functionality
- Search query trends
- Popular searches
- Search-to-click conversion
- Autocomplete performance

**Search Terms:** "search", "analytics", "queries"

### 3. Ad Performance Dashboard
**Purpose:** Track ad effectiveness
- Ad impressions vs clicks
- CTR by ad position
- Revenue attribution
- A/B test results

**Search Terms:** "advertising", "ads", "performance"

### 4. User Behavior Dashboard
**Purpose:** Understand user journeys
- User journey flows
- Session analytics
- Feature usage
- Retention metrics

**Search Terms:** "user behavior", "analytics", "engagement"

---

## 📥 How to Download Dashboards

### Step 1: Browse elastic-content-share.eu
1. Visit: https://elastic-content-share.eu
2. Navigate to: **Downloads** → **Kibana Dashboards**
3. Search for relevant dashboards using terms above

### Step 2: Download JSON Files
1. Click on a dashboard
2. Click **Download Now**
3. Save the JSON file
4. Rename appropriately (e.g., `marketplace-analytics.json`)

### Step 3: Customize for Our Data
1. Open the JSON file
2. Update index patterns to match our Elasticsearch indexes:
   - `marketplace_posts_v2` (main posts index)
   - `marketplace_search_logs` (if we add search logging)
   - `marketplace_ad_events` (if we add ad event logging)

3. Adjust field names to match our schema:
   ```json
   {
     "index_pattern": "marketplace_posts_v2",
     "fields": {
       "title": "title",
       "price": "price",
       "category": "category.name",
       "location": "location.city"
     }
   }
   ```

---

## 🐳 Docker Integration

### Option 1: Init Script (Recommended)

**Create:** `scripts/kibana-import-dashboards.sh`

```bash
#!/bin/bash
set -e

KIBANA_URL="http://localhost:5601"
DASHBOARDS_DIR="./apps/api/kibana-dashboards"

echo "⏳ Waiting for Kibana to be ready..."

# Wait for Kibana API to be available
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if curl -s -f "${KIBANA_URL}/api/status" > /dev/null 2>&1; then
    echo "✅ Kibana is ready!"
    break
  fi
  attempt=$((attempt + 1))
  echo "  Attempt $attempt/$max_attempts..."
  sleep 5
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Kibana failed to start"
  exit 1
fi

# Wait a bit more for Kibana to fully initialize
sleep 10

echo "📊 Importing Kibana dashboards..."

# Import each dashboard JSON file
for dashboard_file in "${DASHBOARDS_DIR}"/*.json; do
  if [ -f "$dashboard_file" ]; then
    filename=$(basename "$dashboard_file")
    echo "  Importing: $filename"
    
    # Use Kibana Saved Objects API
    response=$(curl -s -X POST "${KIBANA_URL}/api/saved_objects/_import?overwrite=true" \
      -H "kbn-xsrf: true" \
      -H "Content-Type: application/json" \
      --form file=@"${dashboard_file}")
    
    if echo "$response" | grep -q '"success":true'; then
      echo "    ✅ Successfully imported: $filename"
    else
      echo "    ⚠️  Warning: $filename may have import issues"
      echo "    Response: $response"
    fi
  fi
done

echo "🎉 Dashboard import complete!"
```

**Update:** `docker-compose.yml`

```yaml
kibana:
  image: docker.elastic.co/kibana/kibana:8.11.1
  container_name: marketplace_kibana
  ports:
    - "5601:5601"
  environment:
    - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    - SERVERNAME=kibana
    - SERVERPUBLICBASEURL=http://localhost:5601
  volumes:
    - ./apps/api/kibana-dashboards:/kibana-dashboards:ro
    - ./scripts/kibana-import-dashboards.sh:/import-dashboards.sh
  depends_on:
    - elasticsearch
  # Note: We'll run the import script manually or via a separate init container
```

### Option 2: Init Container (Alternative)

**Create:** `docker-compose.init.yml`

```yaml
version: '3.8'

services:
  kibana-init:
    image: curlimages/curl:latest
    container_name: marketplace_kibana_init
    depends_on:
      - kibana
    volumes:
      - ./apps/api/kibana-dashboards:/dashboards:ro
      - ./scripts/kibana-import-dashboards.sh:/import.sh
    command: >
      sh -c "
        echo 'Waiting for Kibana...' &&
        sleep 30 &&
        /import.sh
      "
```

---

## 🔧 Backend API Integration

### Create Dashboard Import Endpoint

**File:** `apps/api/src/admin/admin.controller.ts`

```typescript
@Post('admin/kibana/import-dashboards')
@UseGuards(JwtAuthGuard, AdminGuard)
async importDashboards() {
  return this.adminService.importKibanaDashboards();
}
```

**File:** `apps/api/src/admin/admin.service.ts`

```typescript
async importKibanaDashboards() {
  const kibanaUrl = process.env.KIBANA_URL || 'http://localhost:5601';
  const dashboardsDir = path.join(process.cwd(), 'kibana-dashboards');
  
  const results = [];
  const files = fs.readdirSync(dashboardsDir);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(dashboardsDir, file);
      const dashboardJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      try {
        const response = await axios.post(
          `${kibanaUrl}/api/saved_objects/_import?overwrite=true`,
          dashboardJson,
          {
            headers: {
              'kbn-xsrf': 'true',
              'Content-Type': 'application/json',
            },
          }
        );
        
        results.push({ file, success: true });
      } catch (error) {
        results.push({ file, success: false, error: error.message });
      }
    }
  }
  
  return { results };
}
```

---

## 📂 Directory Structure

```
apps/api/
├── kibana-dashboards/
│   ├── marketplace-analytics.json
│   ├── search-analytics.json
│   ├── ad-performance.json
│   └── user-behavior.json
└── scripts/
    └── kibana-import-dashboards.sh
```

---

## 🚀 Usage

### Manual Import (Development)
```bash
# Make script executable
chmod +x scripts/kibana-import-dashboards.sh

# Run after Kibana is up
./scripts/kibana-import-dashboards.sh
```

### Automatic Import (Production)
1. Place dashboard JSON files in `apps/api/kibana-dashboards/`
2. Start containers: `docker-compose up -d`
3. Wait for Kibana to be ready
4. Run import script or use init container

### Via Admin Panel
1. Navigate to Admin Panel → Dashboard Management
2. Click "Import Dashboards"
3. System will import all JSON files from `kibana-dashboards/`

---

## 🔍 Verifying Import

### Check via Kibana UI
1. Open: http://localhost:5601
2. Navigate: **Management** → **Saved Objects** → **Dashboard**
3. Verify imported dashboards appear

### Check via API
```bash
curl http://localhost:5601/api/saved_objects/_find?type=dashboard
```

---

## 📝 Customizing Dashboards

### Update Index Patterns
1. Open dashboard JSON
2. Find `references` array
3. Update index pattern IDs to match your Elasticsearch indexes

### Update Field Mappings
1. Open dashboard JSON
2. Search for field names
3. Replace with your actual field names from Elasticsearch mapping

### Example Customization
```json
{
  "attributes": {
    "title": "Marketplace Analytics",
    "kibanaSavedObjectMeta": {
      "searchSourceJSON": "{\"index\":\"marketplace_posts_v2\"}"
    },
    "panelsJSON": "[{\"embeddableConfig\":{\"title\":\"Posts by Category\"}}]"
  }
}
```

---

## 🐛 Troubleshooting

### Issue: Dashboards not importing
**Solution:**
- Check Kibana logs: `docker logs marketplace_kibana`
- Verify JSON files are valid
- Ensure index patterns exist in Elasticsearch

### Issue: "Index pattern not found"
**Solution:**
- Create index patterns in Kibana first
- Or update dashboard JSON to use existing patterns

### Issue: "Field not found"
**Solution:**
- Check Elasticsearch mapping: `GET /marketplace_posts_v2/_mapping`
- Update field names in dashboard JSON

---

## 📚 Resources

- **elastic-content-share.eu**: https://elastic-content-share.eu
- **Kibana Saved Objects API**: https://www.elastic.co/guide/en/kibana/current/saved-objects-api.html
- **Kibana Dashboard JSON Format**: https://www.elastic.co/guide/en/kibana/current/dashboard-api.html

---

**Last Updated:** 2025-01-XX

