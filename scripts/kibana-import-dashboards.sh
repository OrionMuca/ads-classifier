#!/bin/bash
set -e

KIBANA_URL="${KIBANA_URL:-http://localhost:5601}"
DASHBOARDS_DIR="${DASHBOARDS_DIR:-./apps/api/kibana-dashboards}"
MAX_ATTEMPTS=30
ATTEMPT=0

echo "📊 Kibana Dashboard Auto-Import Script"
echo "======================================"
echo "Kibana URL: $KIBANA_URL"
echo "Dashboards Directory: $DASHBOARDS_DIR"
echo ""

# Wait for Kibana to be ready
echo "⏳ Waiting for Kibana to be ready..."
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if curl -s -f "${KIBANA_URL}/api/status" > /dev/null 2>&1; then
    echo "✅ Kibana is ready!"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  echo "  Attempt $ATTEMPT/$MAX_ATTEMPTS..."
  sleep 5
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "❌ Kibana failed to start after $MAX_ATTEMPTS attempts"
  exit 1
fi

# Wait a bit more for Kibana to fully initialize
echo "⏳ Waiting for Kibana to fully initialize..."
sleep 10

# Check if dashboards directory exists
if [ ! -d "$DASHBOARDS_DIR" ]; then
  echo "❌ Dashboards directory not found: $DASHBOARDS_DIR"
  exit 1
fi

echo ""
echo "📥 Importing Kibana dashboards..."
echo ""

IMPORTED=0
FAILED=0

# Import NDJSON files (multiple objects in one file)
for dashboard_file in "${DASHBOARDS_DIR}"/*.ndjson; do
  if [ -f "$dashboard_file" ]; then
    filename=$(basename "$dashboard_file")
    echo "  📄 Importing NDJSON: $filename"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "${KIBANA_URL}/api/saved_objects/_import?overwrite=true" \
      -H "kbn-xsrf: true" \
      --form file=@"${dashboard_file}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || echo "$body" | grep -q '"success":true'; then
      echo "    ✅ Successfully imported: $filename"
      IMPORTED=$((IMPORTED + 1))
    else
      echo "    ⚠️  Warning: $filename may have import issues (HTTP $http_code)"
      echo "    Response: $body" | head -c 200
      echo ""
      FAILED=$((FAILED + 1))
    fi
  fi
done

# Import JSON files (single dashboard object)
for dashboard_file in "${DASHBOARDS_DIR}"/*.json; do
  if [ -f "$dashboard_file" ]; then
    filename=$(basename "$dashboard_file")
    echo "  📄 Importing JSON: $filename"
    
    # Convert JSON to NDJSON format for import
    # Kibana expects NDJSON format even for single objects
    temp_ndjson=$(mktemp)
    jq -c '.objects[]' "$dashboard_file" > "$temp_ndjson" 2>/dev/null || {
      # If jq fails, try to import as-is (might be already in correct format)
      cp "$dashboard_file" "$temp_ndjson"
    }
    
    response=$(curl -s -w "\n%{http_code}" -X POST "${KIBANA_URL}/api/saved_objects/_import?overwrite=true" \
      -H "kbn-xsrf: true" \
      --form file=@"${temp_ndjson}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    rm -f "$temp_ndjson"
    
    if [ "$http_code" = "200" ] || echo "$body" | grep -q '"success":true'; then
      echo "    ✅ Successfully imported: $filename"
      IMPORTED=$((IMPORTED + 1))
    else
      echo "    ⚠️  Warning: $filename may have import issues (HTTP $http_code)"
      echo "    Response: $body" | head -c 200
      echo ""
      FAILED=$((FAILED + 1))
    fi
  fi
done

echo ""
echo "======================================"
echo "📊 Import Summary:"
echo "  ✅ Successfully imported: $IMPORTED"
if [ $FAILED -gt 0 ]; then
  echo "  ⚠️  Failed/Warnings: $FAILED"
fi
echo ""
echo "🎉 Dashboard import complete!"
echo ""
echo "💡 Next steps:"
echo "   1. Open Kibana: $KIBANA_URL"
echo "   2. Navigate to: Management → Saved Objects → Dashboard"
echo "   3. Verify your dashboards are available"
echo ""

