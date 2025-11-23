# 📊 Kibana Dashboards

This directory contains pre-configured Kibana dashboards for the Marketplace application.

## Available Dashboards

### 1. **marketplace-posts.json**
**Purpose:** Marketplace posts analytics dashboard
- Posts by status (ACTIVE, SOLD, etc.)
- Posts over time
- Top categories
- Price distribution
- Posts by city
- Price statistics

**Index Pattern:** `marketplace_posts_v2`

**Fields Used:**
- `status.keyword` - Post status
- `createdAt` - Creation timestamp
- `categoryName.keyword` - Category name
- `price` - Post price
- `city.keyword` - City name

### 2. **log-overview.ndjson**
**Purpose:** General log overview dashboard
- Log categories distribution
- Log sources
- Log host OS
- Log users
- Logs percentage over time per type
- Log rate over time per host
- Error logs search

**Index Pattern:** `logs-*` (needs to be created in Kibana)

**Note:** This dashboard is generic and may need customization for your specific log structure.

### 3. **slow-query.ndjson**
**Purpose:** APM slow query analysis dashboard
- Overall count of records
- Transaction histogram
- Top 7 transactions
- Transaction duration
- ES Query took information
- Top 15 queries from URL
- Time spent analysis (ES vs Python)
- HTTP Status code distribution

**Index Pattern:** `traces-apm*,apm-*,logs-apm*,metrics-apm*` (APM data)

**Note:** This dashboard requires APM (Application Performance Monitoring) data. If you're not using APM, you may need to customize it or skip it.

## Import Instructions

### Automatic Import (Recommended)
The dashboards will be automatically imported when you start the containers:

```bash
docker-compose up -d
# Wait for Kibana to be ready, then run:
./scripts/kibana-import-dashboards.sh
```

### Manual Import
1. Open Kibana: http://localhost:5601
2. Navigate to: **Management** → **Stack Management** → **Saved Objects**
3. Click **Import**
4. Select the dashboard file(s) you want to import
5. Click **Import**

### Via API
```bash
# For NDJSON files
curl -X POST "http://localhost:5601/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  --form file=@log-overview.ndjson

# For JSON files (convert to NDJSON first)
```

## Customization

### Updating Index Patterns
If your Elasticsearch index names differ, update the dashboards:

1. Open the dashboard JSON/NDJSON file
2. Search for `"index":` or `"indexRefName"`
3. Replace with your actual index pattern
4. Re-import the dashboard

### Adding New Dashboards
1. Export dashboard from Kibana UI
2. Save to this directory
3. Run the import script

## Troubleshooting

### Dashboard shows "No data"
- Verify the index pattern exists in Kibana
- Check that data exists in Elasticsearch for that index
- Ensure field names match between dashboard and actual data

### Import fails
- Check Kibana logs: `docker logs marketplace_kibana`
- Verify JSON/NDJSON format is valid
- Ensure Kibana is fully started before importing

### Field not found errors
- Check Elasticsearch mapping: `GET /marketplace_posts_v2/_mapping`
- Update field names in dashboard JSON to match your schema

## Next Steps

1. **Create Index Patterns** in Kibana for:
   - `marketplace_posts_v2` (required for marketplace-posts.json)
   - `logs-*` (optional, for log-overview.ndjson)
   - `traces-apm*` (optional, for slow-query.ndjson)

2. **Verify Data** exists in Elasticsearch:
   ```bash
   curl http://localhost:9200/marketplace_posts_v2/_count
   ```

3. **Customize Dashboards** to match your specific needs

4. **Create Additional Dashboards** for:
   - Ad performance analytics
   - Search analytics
   - User behavior
   - Revenue metrics

