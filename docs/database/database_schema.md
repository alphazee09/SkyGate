# SkyGate Database Schema Design

This document outlines the database schema design for the SkyGate AI detection application. The schema is designed to efficiently store and manage user data, uploaded files, detection results, and system configurations.

## Database Type Selection

For the SkyGate application, we'll use a hybrid approach:

1. **PostgreSQL** (Relational Database):
   - For structured data with clear relationships
   - User accounts, authentication, and permissions
   - Upload history and detection results
   - Strong ACID compliance for critical data

2. **MongoDB** (NoSQL Database):
   - For storing detection metadata and analysis results
   - Flexible schema for varying detection parameters
   - Efficient storage of JSON-like detection data
   - Better performance for complex nested data structures

## Schema Design

### PostgreSQL Schema

#### 1. Users Table

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    account_status VARCHAR(20) DEFAULT 'active',
    profile_image_url VARCHAR(255)
);
```

#### 2. Uploads Table

```sql
CREATE TABLE uploads (
    upload_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_processed BOOLEAN DEFAULT FALSE,
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    thumbnail_path VARCHAR(255)
);
```

#### 3. Detection Results Table

```sql
CREATE TABLE detection_results (
    result_id SERIAL PRIMARY KEY,
    upload_id INTEGER REFERENCES uploads(upload_id) ON DELETE CASCADE,
    is_ai_generated BOOLEAN,
    confidence_score DECIMAL(5,4) NOT NULL,
    processing_time DECIMAL(10,3) NOT NULL, -- in seconds
    detection_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    algorithm_version VARCHAR(50) NOT NULL,
    result_summary TEXT,
    metadata_id VARCHAR(50) -- Reference to MongoDB document ID
);
```

#### 4. Detection Methods Table

```sql
CREATE TABLE detection_methods (
    method_id SERIAL PRIMARY KEY,
    method_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    weight DECIMAL(3,2) DEFAULT 1.00, -- For weighted ensemble approach
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. Method Results Table

```sql
CREATE TABLE method_results (
    method_result_id SERIAL PRIMARY KEY,
    result_id INTEGER REFERENCES detection_results(result_id) ON DELETE CASCADE,
    method_id INTEGER REFERENCES detection_methods(method_id) ON DELETE CASCADE,
    is_ai_generated BOOLEAN,
    confidence_score DECIMAL(5,4) NOT NULL,
    processing_time DECIMAL(10,3) NOT NULL, -- in seconds
    result_details JSONB -- Allows storing method-specific results
);
```

#### 6. API Keys Table

```sql
CREATE TABLE api_keys (
    key_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    api_key VARCHAR(100) UNIQUE NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    request_limit INTEGER DEFAULT 1000,
    requests_made INTEGER DEFAULT 0
);
```

#### 7. Usage Logs Table

```sql
CREATE TABLE usage_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    api_key_id INTEGER REFERENCES api_keys(key_id) ON DELETE SET NULL,
    request_type VARCHAR(50) NOT NULL,
    request_path VARCHAR(255) NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    response_code INTEGER NOT NULL,
    processing_time DECIMAL(10,3) NOT NULL, -- in seconds
    ip_address VARCHAR(45),
    user_agent TEXT
);
```

### MongoDB Schema

#### 1. Detection Metadata Collection

```javascript
{
  _id: ObjectId,
  result_id: Number,  // Reference to PostgreSQL detection_results.result_id
  upload_id: Number,  // Reference to PostgreSQL uploads.upload_id
  user_id: Number,    // Reference to PostgreSQL users.user_id
  
  // General metadata
  file_info: {
    dimensions: { width: Number, height: Number },
    color_space: String,
    bit_depth: Number,
    compression: String
  },
  
  // EXIF metadata analysis
  exif_data: {
    exists: Boolean,
    camera_make: String,
    camera_model: String,
    lens_info: String,
    creation_date: Date,
    software: String,
    gps_coordinates: { latitude: Number, longitude: Number },
    analysis_result: {
      is_suspicious: Boolean,
      confidence: Number,
      anomalies: [String]
    }
  },
  
  // Pixel-level analysis
  pixel_analysis: {
    prnu_results: {
      pattern_score: Number,
      is_suspicious: Boolean,
      confidence: Number
    },
    ela_results: {
      error_level_score: Number,
      is_suspicious: Boolean,
      confidence: Number,
      ela_image_path: String  // Path to the ELA visualization
    },
    texture_analysis: {
      smoothness_score: Number,
      is_suspicious: Boolean,
      confidence: Number
    }
  },
  
  // Deep learning model results
  model_results: [
    {
      model_name: String,
      model_version: String,
      is_ai_generated: Boolean,
      confidence: Number,
      processing_time: Number,
      feature_importance: Object  // Model-specific feature importance
    }
  ],
  
  // Visual anomalies detected
  visual_anomalies: {
    detected_anomalies: [
      {
        type: String,  // e.g., "unnatural_fingers", "text_errors", "lighting_inconsistency"
        confidence: Number,
        bounding_box: { x: Number, y: Number, width: Number, height: Number },
        description: String
      }
    ],
    heatmap_path: String  // Path to anomaly heatmap visualization
  },
  
  // Final aggregated results
  aggregated_results: {
    is_ai_generated: Boolean,
    confidence_score: Number,
    contributing_factors: [
      {
        factor: String,
        weight: Number,
        contribution: Number
      }
    ]
  },
  
  created_at: Date,
  updated_at: Date
}
```

#### 2. System Configuration Collection

```javascript
{
  _id: ObjectId,
  config_name: String,
  config_type: String,  // e.g., "model", "algorithm", "threshold"
  
  // Configuration parameters
  parameters: {
    // Flexible structure based on config_type
    // For example, for model configurations:
    model_path: String,
    weights_path: String,
    input_size: { width: Number, height: Number },
    batch_size: Number,
    threshold: Number
  },
  
  is_active: Boolean,
  created_at: Date,
  updated_at: Date,
  created_by: Number  // Reference to PostgreSQL users.user_id
}
```

## Database Relationships

### Entity Relationship Diagram (ERD)

The relationships between the PostgreSQL tables can be visualized as follows:

1. A User can have multiple Uploads (one-to-many)
2. A User can have multiple API Keys (one-to-many)
3. An Upload has one Detection Result (one-to-one)
4. A Detection Result has multiple Method Results (one-to-many)
5. A Detection Method can be used in multiple Method Results (one-to-many)
6. A Detection Result is linked to one MongoDB Detection Metadata document (one-to-one)
7. Usage Logs can be associated with Users and API Keys (many-to-one)

## Indexing Strategy

### PostgreSQL Indexes

```sql
-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Uploads table
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_upload_date ON uploads(upload_date);
CREATE INDEX idx_uploads_is_processed ON uploads(is_processed);

-- Detection Results table
CREATE INDEX idx_detection_results_upload_id ON detection_results(upload_id);
CREATE INDEX idx_detection_results_is_ai_generated ON detection_results(is_ai_generated);
CREATE INDEX idx_detection_results_confidence_score ON detection_results(confidence_score);

-- Method Results table
CREATE INDEX idx_method_results_result_id ON method_results(result_id);
CREATE INDEX idx_method_results_method_id ON method_results(method_id);

-- API Keys table
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_api_key ON api_keys(api_key);

-- Usage Logs table
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_request_date ON usage_logs(request_date);
CREATE INDEX idx_usage_logs_api_key_id ON usage_logs(api_key_id);
```

### MongoDB Indexes

```javascript
// Detection Metadata Collection
db.detection_metadata.createIndex({ "result_id": 1 }, { unique: true });
db.detection_metadata.createIndex({ "upload_id": 1 });
db.detection_metadata.createIndex({ "user_id": 1 });
db.detection_metadata.createIndex({ "aggregated_results.is_ai_generated": 1 });
db.detection_metadata.createIndex({ "created_at": 1 });

// System Configuration Collection
db.system_configuration.createIndex({ "config_name": 1 }, { unique: true });
db.system_configuration.createIndex({ "config_type": 1 });
db.system_configuration.createIndex({ "is_active": 1 });
```

## Data Migration and Versioning

To support future schema changes and ensure backward compatibility:

1. **Schema Versioning**: Each major schema change will be versioned
2. **Migration Scripts**: SQL and JavaScript migration scripts will be maintained
3. **Change Logs**: Documentation of all schema changes will be maintained

## Security Considerations

1. **Encryption**: Sensitive data (like password hashes) will be encrypted
2. **Access Control**: Role-based access control will be implemented
3. **Data Validation**: Input validation will be performed at both application and database levels
4. **Audit Trails**: All critical operations will be logged

## Performance Considerations

1. **Connection Pooling**: Implement connection pooling for both PostgreSQL and MongoDB
2. **Query Optimization**: Regular query performance analysis and optimization
3. **Caching Strategy**: Implement Redis caching for frequently accessed data
4. **Sharding Strategy**: Prepare for horizontal scaling through sharding if needed

## Backup and Recovery Strategy

1. **Regular Backups**: Daily full backups and hourly incremental backups
2. **Point-in-Time Recovery**: Enable WAL (Write-Ahead Logging) for PostgreSQL
3. **Replication**: Set up replica sets for MongoDB and replication for PostgreSQL
4. **Disaster Recovery Plan**: Document procedures for various failure scenarios

This database schema design provides a robust foundation for the SkyGate application, balancing performance, flexibility, and data integrity requirements.
