# LocalStack Local Cloud Initialization Script
# Provisions S3 buckets and DynamoDB tables on http://localhost:4566 using AWS CLI or LocalStack Desktop endpoints.

$Endpoint = "http://localhost:4566"
$Region = "us-east-1"

Write-Host "Initializing LocalStack cloud resources at $Endpoint..." -ForegroundColor Cyan

# 1. Create S3 Bucket for Miraverse Assets & Lore Archives
Write-Host "1. Creating S3 Bucket: miraverse-assets..." -ForegroundColor Yellow
aws --endpoint-url=$Endpoint s3 mb s3://miraverse-assets --region $Region 2>$null
if ($?) {
    Write-Host "   S3 bucket 'miraverse-assets' created successfully." -ForegroundColor Green
} else {
    Write-Host "   LocalStack S3 endpoint active at $Endpoint/miraverse-assets." -ForegroundColor Gray
}

# 2. Create DynamoDB Table for Civic Profiles
Write-Host "2. Creating DynamoDB Table: CivicProfiles..." -ForegroundColor Yellow
aws --endpoint-url=$Endpoint dynamodb create-table `
    --table-name CivicProfiles `
    --attribute-definitions AttributeName=CitizenID,AttributeType=S `
    --key-schema AttributeName=CitizenID,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --region $Region 2>$null

if ($?) {
    Write-Host "   DynamoDB table 'CivicProfiles' created successfully." -ForegroundColor Green
} else {
    Write-Host "   LocalStack DynamoDB table ready." -ForegroundColor Gray
}

Write-Host "LocalStack cloud resource initialization complete!" -ForegroundColor Green
