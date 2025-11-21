# AWS Deployment Guide

This guide covers deploying ARC Line server on AWS. **AWS Fargate (ECS) is the recommended approach** for Twilio ConversationRelay applications, as it provides the best support for long-lived WebSocket connections and aligns with Twilio's official reference architecture.

## Prerequisites

- AWS account with appropriate permissions
- AWS CLI installed and configured (see installation instructions below)
- Docker installed and running (for containerized deployment)
  - **Windows**: Docker Desktop must be installed and running
  - **macOS**: Docker Desktop must be installed and running
  - **Linux**: Docker Engine must be installed and the service running
- Node.js 18+ runtime
- Supabase project set up
- Twilio account with phone number configured

### Pre-Deployment Checklist

Before deploying, ensure the following AWS resources are set up:

1. **ECS Service-Linked Role** (Required for Fargate deployment):

   ```bash
   # Check if the role exists
   aws iam get-role --role-name AWSServiceRoleForECS 2>&1 | grep -q "NoSuchEntity" && echo "Role does not exist" || echo "Role exists"

   # If it doesn't exist, create it:
   aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com
   ```

   This role is required for ECS to create clusters. If you get an error saying the role already exists, that's fine - it means it's already set up.

### Installing AWS CLI

The AWS CLI is required for deploying and managing your AWS resources. Install it based on your operating system:

#### macOS

```bash
# Using Homebrew (recommended)
brew install awscli

# Or using pip
pip3 install awscli
```

#### Linux

```bash
# Download and install
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

#### Windows

1. **Using MSI Installer** (recommended):

   - Download the AWS CLI MSI installer from: https://awscli.amazonaws.com/AWSCLIV2.msi
   - Run the installer and follow the prompts
   - Open a new Command Prompt or PowerShell window

2. **Using pip**:
   ```powershell
   pip install awscli
   ```

#### Verify Installation

After installation, verify AWS CLI is working:

```bash
aws --version
```

You should see output like: `aws-cli/2.x.x Python/3.x.x ...`

#### Configure AWS CLI

After installation, configure AWS CLI with your credentials:

```bash
aws configure
```

You'll be prompted for:

- **AWS Access Key ID**: Your AWS access key
- **AWS Secret Access Key**: Your AWS secret key
- **Default region name**: e.g., `us-east-1`
- **Default output format**: `json` (recommended)

**Note**: If you don't have AWS access keys, create them in the AWS Console:

1. Go to IAM → Users → Your User → Security Credentials
2. Click "Create access key"
3. Choose "Command Line Interface (CLI)"
4. Download and securely store your keys

## Recommended: AWS Fargate (ECS) with Application Load Balancer

**This is the recommended architecture** for Twilio ConversationRelay applications. It provides:

- ✅ Excellent support for long-lived WebSocket connections
- ✅ Serverless container management (no EC2 instances to manage)
- ✅ Automatic scaling based on demand
- ✅ Aligns with Twilio's official reference implementations
- ✅ Production-grade reliability and scalability

### Option 1: AWS Fargate with AWS SAM/CloudFormation (Recommended)

This approach uses Infrastructure as Code (IaC) to deploy your ConversationRelay server on AWS Fargate with an Application Load Balancer. This is the **recommended architecture** aligned with Twilio's official reference implementations.

#### Step 1: Create Dockerfile

Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.js"]
```

#### Step 2: Build and Push Docker Image to ECR

1. **Create ECR repository**:

   ```bash
   aws ecr create-repository --repository-name arcline-server
   ```

2. **Build and push image**:

   ```bash
   cd server
   # Step 1: Login to ECR (replace your-account-id with your actual AWS account ID)
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

   # Step 2: Build the Docker image with a local tag
   docker build -t arcline-server .

   # Step 3: Tag the image with the ECR repository URL (required for pushing to ECR)
   # IMPORTANT: Include the forward slash between the ECR URL and image name
   docker tag arcline-server:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest

   # Step 4: Push the ECR-tagged image (NOT the local tag)
   docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest
   ```

   **Important**: You must push the ECR-tagged image (the one with the full ECR URL), not the local tag `arcline-server:latest`. The `docker tag` command creates a new tag pointing to the same image, and you need to push that ECR-tagged version.

3. **Get your ECR Image URI** (needed for SAM deployment):

   After successfully pushing the image, the ECR image URI is the same URL you used to push:

   ```
   your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest
   ```

   You can also retrieve it with:

   ```bash
   # macOS/Linux/Windows (same command)
   # Get the repository URI
   aws ecr describe-repositories --repository-names arcline-server --query "repositories[0].repositoryUri" --output text

   # Append :latest to get the full image URI
   # Example output: 508767886604.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest
   ```

   Save this URI - you'll need it for the `ImageUri` parameter during `sam deploy --guided`.

#### Step 3: Deploy with AWS SAM

1. **Install AWS SAM CLI**:

   ```bash
   # macOS
   brew install aws-sam-cli

   # Linux
   pip install aws-sam-cli

   # Windows
   # Option 1: Using MSI Installer (recommended)
   # Download from: https://github.com/aws/aws-sam-cli/releases/latest
   # Download the .msi file and run the installer

   # Option 2: Using pip
   pip install aws-sam-cli

   # Option 3: Using Chocolatey
   choco install aws-sam-cli
   ```

   Verify installation:

   ```bash
   # macOS/Linux
   sam --version

   # Windows (PowerShell or CMD)
   sam --version
   ```

2. **Create SAM template** (`server/template.yaml`):

   ```yaml
   AWSTemplateFormatVersion: "2010-09-09"
   Transform: AWS::Serverless-2016-10-31
   Description: ARC Line ConversationRelay Server on Fargate

   Parameters:
     ImageUri:
       Type: String
       Description: ECR image URI
     Domain:
       Type: String
       Description: Production domain name
     SupabaseUrl:
       Type: String
       Description: Supabase project URL
     SupabaseAnonKey:
       Type: String
       NoEcho: true
       Description: Supabase anonymous key
     TwilioAccountSid:
       Type: String
       NoEcho: true
       Description: Twilio Account SID
     TwilioAuthToken:
       Type: String
       NoEcho: true
       Description: Twilio Auth Token

   Resources:
     # ECS Cluster
     ECSCluster:
       Type: AWS::ECS::Cluster
       Properties:
         ClusterName: arcline-cluster
         CapacityProviders:
           - FARGATE
           - FARGATE_SPOT

     # CloudWatch Log Group
     LogGroup:
       Type: AWS::Logs::LogGroup
       Properties:
         LogGroupName: /ecs/arcline-server
         RetentionInDays: 7

     # ECS Task Definition
     TaskDefinition:
       Type: AWS::ECS::TaskDefinition
       Properties:
         Family: arcline-server
         NetworkMode: awsvpc
         RequiresCompatibilities:
           - FARGATE
         Cpu: "256"
         Memory: "512"
         ContainerDefinitions:
           - Name: arcline-server
             Image: !Ref ImageUri
             PortMappings:
               - ContainerPort: 8080
                 Protocol: tcp
             Environment:
               - Name: PORT
                 Value: "8080"
               - Name: NODE_ENV
                 Value: production
               - Name: DOMAIN
                 Value: !Ref Domain
               - Name: SUPABASE_URL
                 Value: !Ref SupabaseUrl
               - Name: SUPABASE_ANON_KEY
                 Value: !Ref SupabaseAnonKey
               - Name: TWILIO_ACCOUNT_SID
                 Value: !Ref TwilioAccountSid
               - Name: TWILIO_AUTH_TOKEN
                 Value: !Ref TwilioAuthToken
             LogConfiguration:
               LogDriver: awslogs
               Options:
                 awslogs-group: !Ref LogGroup
                 awslogs-region: !Ref AWS::Region
                 awslogs-stream-prefix: ecs

     # VPC and Networking
     VPC:
       Type: AWS::EC2::VPC
       Properties:
         CidrBlock: 10.0.0.0/16
         EnableDnsHostnames: true
         EnableDnsSupport: true

     PublicSubnet1:
       Type: AWS::EC2::Subnet
       Properties:
         VpcId: !Ref VPC
         AvailabilityZone: !Select [0, !GetAZs ""]
         CidrBlock: 10.0.1.0/24
         MapPublicIpOnLaunch: true

     PublicSubnet2:
       Type: AWS::EC2::Subnet
       Properties:
         VpcId: !Ref VPC
         AvailabilityZone: !Select [1, !GetAZs ""]
         CidrBlock: 10.0.2.0/24
         MapPublicIpOnLaunch: true

     InternetGateway:
       Type: AWS::EC2::InternetGateway

     InternetGatewayAttachment:
       Type: AWS::EC2::VPCGatewayAttachment
       Properties:
         InternetGatewayId: !Ref InternetGateway
         VpcId: !Ref VPC

     PublicRouteTable:
       Type: AWS::EC2::RouteTable
       Properties:
         VpcId: !Ref VPC

     DefaultPublicRoute:
       Type: AWS::EC2::Route
       DependsOn: InternetGatewayAttachment
       Properties:
         RouteTableId: !Ref PublicRouteTable
         DestinationCidrBlock: 0.0.0.0/0
         GatewayId: !Ref InternetGateway

     PublicSubnet1RouteTableAssociation:
       Type: AWS::EC2::SubnetRouteTableAssociation
       Properties:
         RouteTableId: !Ref PublicRouteTable
         SubnetId: !Ref PublicSubnet1

     PublicSubnet2RouteTableAssociation:
       Type: AWS::EC2::SubnetRouteTableAssociation
       Properties:
         RouteTableId: !Ref PublicRouteTable
         SubnetId: !Ref PublicSubnet2

     # Security Group
     SecurityGroup:
       Type: AWS::EC2::SecurityGroup
       Properties:
         GroupName: arcline-server-sg
         GroupDescription: Security group for ARC Line server
         VpcId: !Ref VPC
         SecurityGroupIngress:
           - IpProtocol: tcp
             FromPort: 8080
             ToPort: 8080
             CidrIp: 0.0.0.0/0
         SecurityGroupEgress:
           - IpProtocol: -1
             CidrIp: 0.0.0.0/0

     # Application Load Balancer
     LoadBalancer:
       Type: AWS::ElasticLoadBalancingV2::LoadBalancer
       Properties:
         Name: arcline-alb
         Type: application
         Scheme: internet-facing
         Subnets:
           - !Ref PublicSubnet1
           - !Ref PublicSubnet2
         SecurityGroups:
           - !Ref ALBSecurityGroup

     ALBSecurityGroup:
       Type: AWS::EC2::SecurityGroup
       Properties:
         GroupName: arcline-alb-sg
         GroupDescription: Security group for Application Load Balancer
         VpcId: !Ref VPC
         SecurityGroupIngress:
           - IpProtocol: tcp
             FromPort: 80
             ToPort: 80
             CidrIp: 0.0.0.0/0
           - IpProtocol: tcp
             FromPort: 443
             ToPort: 443
             CidrIp: 0.0.0.0/0
         SecurityGroupEgress:
           - IpProtocol: -1
             CidrIp: 0.0.0.0/0

     # Target Group
     TargetGroup:
       Type: AWS::ElasticLoadBalancingV2::TargetGroup
       Properties:
         Name: arcline-tg
         Port: 8080
         Protocol: HTTP
         VpcId: !Ref VPC
         TargetType: ip
         HealthCheckPath: /health
         HealthCheckIntervalSeconds: 30
         HealthCheckTimeoutSeconds: 5
         HealthyThresholdCount: 2
         UnhealthyThresholdCount: 3

     # Load Balancer Listener (HTTP)
     HTTPListener:
       Type: AWS::ElasticLoadBalancingV2::Listener
       Properties:
         DefaultActions:
           - Type: forward
             TargetGroupArn: !Ref TargetGroup
         LoadBalancerArn: !Ref LoadBalancer
         Port: 80
         Protocol: HTTP

     # ECS Service
     ECSService:
       Type: AWS::ECS::Service
       DependsOn:
         - HTTPListener
         - TargetGroup
       Properties:
         ServiceName: arcline-server
         Cluster: !Ref ECSCluster
         TaskDefinition: !Ref TaskDefinition
         DesiredCount: 1
         LaunchType: FARGATE
         NetworkConfiguration:
           AwsvpcConfiguration:
             AssignPublicIp: ENABLED
             Subnets:
               - !Ref PublicSubnet1
               - !Ref PublicSubnet2
             SecurityGroups:
               - !Ref SecurityGroup
         LoadBalancers:
           - ContainerName: arcline-server
             ContainerPort: 8080
             TargetGroupArn: !Ref TargetGroup
         DeploymentConfiguration:
           MaximumPercent: 200
           MinimumHealthyPercent: 100

   Outputs:
     LoadBalancerDNS:
       Description: DNS name of the load balancer
       Value: !GetAtt LoadBalancer.DNSName
     LoadBalancerURL:
       Description: Full URL to access the application
       Value: !Sub "http://${LoadBalancer.DNSName}"
   ```

3. **Deploy with SAM**:

   ```bash
   # macOS/Linux
   cd server
   sam build
   sam deploy --guided
   ```

   ```powershell
   # Windows (PowerShell)
   cd server
   sam build
   sam deploy --guided
   ```

   During guided deployment, you'll be prompted for:

   - Stack name: `arcline-server`
   - AWS Region: `us-east-1` (or your preferred region)
   - ImageUri: Your ECR image URI (see below for how to get this)
   - Domain: Your production domain (see below for options)
   - Supabase and Twilio credentials

   **What to enter for Domain**:

   The Domain parameter is used by your server to construct WebSocket URLs for Twilio. You have several options:

   **Option 1: Use Load Balancer DNS (Recommended for initial deployment)**

   For your first deployment, you can use a placeholder or leave it empty, then update it after deployment:

   - Enter: `placeholder` or leave empty (you'll update it after deployment)
   - After deployment completes, get your load balancer DNS name:
     ```bash
     aws cloudformation describe-stacks --stack-name arcline-server --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" --output text
     ```
   - Update the stack with the actual domain:
     ```bash
     aws cloudformation update-stack --stack-name arcline-server --use-previous-template --parameters ParameterKey=Domain,ParameterValue=your-load-balancer-dns-name.elb.amazonaws.com ParameterKey=ImageUri,UsePreviousValue=true ParameterKey=SupabaseUrl,UsePreviousValue=true ParameterKey=SupabaseAnonKey,UsePreviousValue=true ParameterKey=TwilioAccountSid,UsePreviousValue=true ParameterKey=TwilioAuthToken,UsePreviousValue=true
     ```

   **Option 2: Use a Custom Domain (If you have one)**

   If you have a custom domain (e.g., `arcline.example.com`):

   - Enter your custom domain: `arcline.example.com`
   - After deployment, point your domain's DNS to the load balancer DNS name
   - The domain must resolve to your load balancer for Twilio webhooks to work

   **Option 3: Use Load Balancer DNS directly**

   If you know the load balancer DNS format, you can construct it:

   - Format: `<stack-name>-<random-id>.<region>.elb.amazonaws.com`
   - Example: `arcline-server-1234567890.us-east-1.elb.amazonaws.com`
   - However, you won't know the exact DNS until after deployment, so Option 1 is recommended

   **Note**: The domain is used in the server's `DOMAIN` environment variable to construct WebSocket URLs. After deployment, you can update it using CloudFormation update-stack if needed.

   **Getting your ECR Image URI**:

   After you've built and pushed your Docker image to ECR (Step 2), you can get the image URI in several ways:

   ```bash
   # Option 1: Get from AWS CLI (recommended)
   # macOS/Linux/Windows (same command)
   aws ecr describe-repositories --repository-names arcline-server --query "repositories[0].repositoryUri" --output text
   ```

   This will return something like: `508767886604.dkr.ecr.us-east-1.amazonaws.com/arcline-server`

   Then append `:latest` to get the full image URI:

   ```
   508767886604.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest
   ```

   ```bash
   # Option 2: Construct it manually
   # Get your AWS account ID
   aws sts get-caller-identity --query Account --output text

   # Your image URI format: <account-id>.dkr.ecr.<region>.amazonaws.com/<repository-name>:<tag>
   # Example: 508767886604.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest
   ```

   ```bash
   # Option 3: List all images in your repository
   aws ecr list-images --repository-name arcline-server --region us-east-1
   ```

   **Note**: If you get a YAML parsing error, check that your `template.yaml` file has correct indentation. All top-level keys (AWSTemplateFormatVersion, Transform, Description, Parameters, Resources, Outputs) must be at column 0 with no indentation.

4. **Get your load balancer URL**:

   ```bash
   # macOS/Linux
   aws cloudformation describe-stacks --stack-name arcline-server --query "Stacks[0].Outputs"
   ```

   ```powershell
   # Windows (PowerShell)
   aws cloudformation describe-stacks --stack-name arcline-server --query "Stacks[0].Outputs"
   ```

   Use the `LoadBalancerDNS` output value as your domain, or configure a custom domain to point to this DNS name.

#### Alternative: Deploy with CloudFormation Directly

If you prefer not to use SAM, you can deploy the CloudFormation template directly:

```bash
# macOS/Linux
aws cloudformation create-stack \
  --stack-name arcline-server \
  --template-body file://template.yaml \
  --parameters \
    ParameterKey=ImageUri,ParameterValue=your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest \
    ParameterKey=Domain,ParameterValue=your-domain.com \
    ParameterKey=SupabaseUrl,ParameterValue=your-supabase-url \
    ParameterKey=SupabaseAnonKey,ParameterValue=your-supabase-key \
    ParameterKey=TwilioAccountSid,ParameterValue=your-twilio-sid \
    ParameterKey=TwilioAuthToken,ParameterValue=your-twilio-token \
  --capabilities CAPABILITY_NAMED_IAM
```

```powershell
# Windows (PowerShell)
aws cloudformation create-stack `
  --stack-name arcline-server `
  --template-body file://template.yaml `
  --parameters `
    ParameterKey=ImageUri,ParameterValue=your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest `
    ParameterKey=Domain,ParameterValue=your-domain.com `
    ParameterKey=SupabaseUrl,ParameterValue=your-supabase-url `
    ParameterKey=SupabaseAnonKey,ParameterValue=your-supabase-key `
    ParameterKey=TwilioAccountSid,ParameterValue=your-twilio-sid `
    ParameterKey=TwilioAuthToken,ParameterValue=your-twilio-token `
  --capabilities CAPABILITY_NAMED_IAM
```

### Option 2: AWS Fargate (Manual Setup)

For more control or if you prefer manual configuration over IaC:

#### Step 1: Prepare the Application

1. **Navigate to the server directory**:

   ```bash
   cd server
   ```

2. **Build the application**:

   ```bash
   npm install
   npm run build
   ```

3. **Create a deployment package**:

   ```bash
   # macOS/Linux
   # Create a zip file with the necessary files
   zip -r ../arcline-server.zip . -x "node_modules/*" "*.git*" "dist/*"
   ```

   ```powershell
   # Windows (PowerShell)
   # Create a zip file with the necessary files
   Compress-Archive -Path * -DestinationPath ..\arcline-server.zip -Exclude node_modules,*.git*,dist
   ```

   Or use the included files:

   - `package.json`
   - `package-lock.json`
   - `server.ts`
   - `tsconfig.json`
   - All source files in `lib/`, `api/`, `types/`, `constants/`
   - `Procfile` (for Elastic Beanstalk)

#### Step 2: Create Elastic Beanstalk Application

1. **Install EB CLI** (if not already installed):

   ```bash
   # macOS/Linux
   pip install awsebcli

   # Windows
   pip install awsebcli
   # Or using pip3 if you have Python 3
   pip3 install awsebcli
   ```

2. **Initialize Elastic Beanstalk**:

   ```bash
   # macOS/Linux/Windows (same command)
   cd server
   eb init
   ```

   - Select your region
   - Choose "Node.js" as the platform
   - Select Node.js version 18 or higher
   - Choose "Application load balancer" for better WebSocket support

3. **Create Environment**:

   ```bash
   # macOS/Linux/Windows (same command)
   eb create arcline-production
   ```

   This will:

   - Create an EC2 instance
   - Set up a load balancer
   - Configure auto-scaling
   - Deploy your application

#### Step 3: Configure Environment Variables

1. **Set environment variables in Elastic Beanstalk**:

   ```bash
   # macOS/Linux
   eb setenv DOMAIN=your-domain.elasticbeanstalk.com \
            SUPABASE_URL=your-supabase-url \
            SUPABASE_ANON_KEY=your-supabase-key \
            TWILIO_ACCOUNT_SID=your-twilio-account-sid \
            TWILIO_AUTH_TOKEN=your-twilio-auth-token \
            NODE_ENV=production \
            PORT=8080
   ```

   ```powershell
   # Windows (PowerShell)
   eb setenv DOMAIN=your-domain.elasticbeanstalk.com `
            SUPABASE_URL=your-supabase-url `
            SUPABASE_ANON_KEY=your-supabase-key `
            TWILIO_ACCOUNT_SID=your-twilio-account-sid `
            TWILIO_AUTH_TOKEN=your-twilio-auth-token `
            NODE_ENV=production `
            PORT=8080
   ```

   Or use the AWS Console:

   - Go to Elastic Beanstalk → Your Environment → Configuration → Software
   - Add environment properties

2. **Configure Load Balancer for WebSocket**:

   - Go to Configuration → Load Balancer
   - Ensure "Connection draining" is enabled
   - Set idle timeout to at least 60 seconds for WebSocket connections

#### Step 4: Configure Custom Domain (Optional)

1. **Get your Elastic Beanstalk URL**:

   ```bash
   # macOS/Linux/Windows (same command)
   eb status
   ```

2. **Set up Route 53 or use your own domain**:

   - Point your domain to the Elastic Beanstalk load balancer
   - Update `DOMAIN` environment variable with your custom domain

#### Step 5: Deploy Updates

```bash
# macOS/Linux/Windows (same command)
eb deploy
```

### Option 3: AWS Elastic Beanstalk (Simpler Alternative)

Elastic Beanstalk provides an easier way to deploy Node.js applications, though it's less optimal for WebSocket connections than Fargate.

For more control over the infrastructure, deploy directly to EC2.

#### Step 1: Launch EC2 Instance

1. **Launch an EC2 instance**:

   - AMI: Amazon Linux 2023 or Ubuntu 22.04 LTS
   - Instance type: t3.small or larger (recommended for production)
   - Security group: Allow HTTP (80), HTTPS (443), and SSH (22)
   - Storage: 20GB minimum

2. **Connect to your instance**:

   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

#### Step 2: Install Dependencies

1. **Install Node.js 18+**:

   ```bash
   # For Amazon Linux
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs

   # For Ubuntu
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2** (process manager):

   ```bash
   sudo npm install -g pm2
   ```

#### Step 3: Deploy Application

1. **Clone repository**:

   ```bash
   git clone https://github.com/jasonrundell/arcline.git
   cd arcline/server
   ```

2. **Install dependencies and build**:

   ```bash
   npm install
   npm run build
   ```

3. **Create environment file**:

   ```bash
   sudo nano /etc/environment
   ```

   Add:

   ```env
   DOMAIN=your-domain.com
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-key
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   NODE_ENV=production
   PORT=8080
   ```

4. **Start with PM2**:

   ```bash
   pm2 start dist/server.js --name arcline-server
   pm2 save
   pm2 startup
   ```

#### Step 4: Set Up Nginx Reverse Proxy

1. **Install Nginx**:

   ```bash
   # Amazon Linux
   sudo yum install -y nginx

   # Ubuntu
   sudo apt-get install -y nginx
   ```

2. **Configure Nginx**:

   ```bash
   sudo nano /etc/nginx/conf.d/arcline.conf
   ```

   Add configuration:

   ```nginx
   upstream arcline_backend {
       server localhost:8080;
   }

   server {
       listen 80;
       server_name your-domain.com;

       # WebSocket support
       location /ws {
           proxy_pass http://arcline_backend;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_read_timeout 86400;
       }

       # Regular HTTP endpoints
       location / {
           proxy_pass http://arcline_backend;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Start Nginx**:

   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

#### Step 5: Set Up SSL with Let's Encrypt

1. **Install Certbot**:

   ```bash
   # Amazon Linux
   sudo yum install -y certbot python3-certbot-nginx

   # Ubuntu
   sudo apt-get install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate**:

   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal** (already configured by certbot):

   ```bash
   sudo certbot renew --dry-run
   ```

#### Step 1: Create Dockerfile

Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.js"]
```

#### Step 2: Build and Push Docker Image to ECR

1. **Create ECR repository**:

   ```bash
   # macOS/Linux/Windows (same command)
   aws ecr create-repository --repository-name arcline-server
   ```

2. **Get your ECR registry URL**:

   ```bash
   # macOS/Linux/Windows (same command)
   # Get your AWS account ID
   aws sts get-caller-identity --query Account --output text

   # Your ECR registry URL will be: <account-id>.dkr.ecr.<region>.amazonaws.com
   # Example: 123456789012.dkr.ecr.us-east-1.amazonaws.com
   ```

   **Important**: Replace `your-account-id` in the commands below with your actual AWS account ID.

3. **Build and push image**:

   ```bash
   # macOS/Linux
   cd server
   # IMPORTANT: Replace 'your-account-id' with your actual AWS account ID
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com
   docker build -t arcline-server .
   docker tag arcline-server:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest
   docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest
   ```

   ```powershell
   # Windows (PowerShell)
   cd server
   $password = aws ecr get-login-password --region us-east-1
   $password | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com
   docker build -t arcline-server .
   docker tag arcline-server:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest
   docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest
   ```

#### Step 3: Create ECS Task Definition

1. **Create task definition JSON**:

   ```json
   {
     "family": "arcline-server",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [
       {
         "name": "arcline-server",
         "image": "your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest",
         "portMappings": [
           {
             "containerPort": 8080,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "PORT",
             "value": "8080"
           },
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "secrets": [
           {
             "name": "DOMAIN",
             "valueFrom": "arn:aws:secretsmanager:region:account:secret:arcline/domain"
           },
           {
             "name": "SUPABASE_URL",
             "valueFrom": "arn:aws:secretsmanager:region:account:secret:arcline/supabase-url"
           },
           {
             "name": "SUPABASE_ANON_KEY",
             "valueFrom": "arn:aws:secretsmanager:region:account:secret:arcline/supabase-key"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/arcline-server",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

2. **Register task definition**:

   ```bash
   # macOS/Linux
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   ```

   ```powershell
   # Windows (PowerShell)
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   ```

#### Step 4: Create ECS Service

1. **Create service with Application Load Balancer**:

   ```bash
   # macOS/Linux
   aws ecs create-service \
     --cluster arcline-cluster \
     --service-name arcline-server \
     --task-definition arcline-server \
     --desired-count 1 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
     --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/arcline-tg/xxx,containerName=arcline-server,containerPort=8080"
   ```

   ```powershell
   # Windows (PowerShell)
   aws ecs create-service `
     --cluster arcline-cluster `
     --service-name arcline-server `
     --task-definition arcline-server `
     --desired-count 1 `
     --launch-type FARGATE `
     --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" `
     --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/arcline-tg/xxx,containerName=arcline-server,containerPort=8080"
   ```

## Why Fargate is Recommended

AWS Fargate is the **best choice** for Twilio ConversationRelay applications because:

1. **WebSocket Support**: Fargate with Application Load Balancer provides excellent support for long-lived WebSocket connections required by ConversationRelay
2. **Serverless**: No EC2 instances to manage - AWS handles the infrastructure
3. **Auto-Scaling**: Automatically scales based on demand
4. **Official Alignment**: Matches Twilio's official reference architecture and recommendations
5. **Production Ready**: Used by Twilio's own reference implementations

For local development, use Docker Compose and ngrok before deploying to this production architecture.

## Why Fargate is Recommended

AWS Fargate is the **best choice** for Twilio ConversationRelay applications because:

1. **WebSocket Support**: Fargate with Application Load Balancer provides excellent support for long-lived WebSocket connections required by ConversationRelay
2. **Serverless**: No EC2 instances to manage - AWS handles the infrastructure
3. **Auto-Scaling**: Automatically scales based on demand
4. **Official Alignment**: Matches Twilio's official reference architecture and recommendations
5. **Production Ready**: Used by Twilio's own reference implementations

For local development, use Docker Compose and ngrok before deploying to this production architecture.

## Configure Twilio Webhooks

After deployment, configure Twilio webhooks:

1. **Get Your Webhook URL**:

   Your TwiML endpoint will be:

   ```
   https://your-domain.com/twiml
   ```

2. **Configure Phone Number**:

   - Go to [Twilio Console > Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/active)
   - Click on your phone number
   - Under **"A CALL COMES IN"**, set:
     - **Webhook URL**: `http://arcline-alb-1106710197.us-east-1.elb.amazonaws.com/twiml` (or `https://` if you have SSL configured)
     - **HTTP Method**: **GET** (⚠️ Important: Must be GET, not POST)
   - Save configuration

   **Common Mistake**: The `/twiml` endpoint is a GET endpoint, not POST. If you set it to POST, Twilio will send a POST request but your server expects GET, causing connection failures.

## Step 4: Set Up Database

1. **Run Database Schema**:

   - Go to Supabase SQL Editor
   - Run the SQL from `docs/DATABASE_SCHEMA.md`
   - Configure Row Level Security policies if needed

## Step 5: Verify Deployment

1. **Test Health Endpoint**:

   Visit `https://your-domain.com/health` in your browser. You should see:

   ```json
   {
     "status": "ok",
     "timestamp": "2024-..."
   }
   ```

2. **Test TwiML Endpoint**:

   Visit `https://your-domain.com/twiml` in your browser. You should see TwiML XML.

3. **Test Functionality**:

   - Call your Twilio phone number
   - Listen to the menu
   - Speak what you want to do
   - Verify responses work correctly

## Monitoring and Logging

### CloudWatch Logs

- **Elastic Beanstalk**: Logs automatically sent to CloudWatch
- **EC2**: Configure CloudWatch agent to send logs
- **ECS**: Configured in task definition (see above)

### Set Up Alarms

1. **Create CloudWatch Alarms**:

   - High CPU utilization
   - High memory usage
   - Error rate thresholds
   - WebSocket connection failures

2. **Set up SNS notifications**:

   - Configure email/SMS alerts for critical issues

## Security Best Practices

1. **Use AWS Secrets Manager**:

   - Store sensitive environment variables in Secrets Manager
   - Reference secrets in task definitions or environment configurations

2. **Security Groups**:

   - Restrict inbound traffic to necessary ports only
   - Use VPC for private networking

3. **IAM Roles**:

   - Use IAM roles with least privilege
   - Don't use root credentials

4. **HTTPS Only**:

   - Always use HTTPS in production
   - Redirect HTTP to HTTPS

5. **Regular Updates**:

   - Keep dependencies updated
   - Apply security patches promptly

## Auto-Scaling

### Elastic Beanstalk

Auto-scaling is configured automatically. Adjust in:

- Configuration → Capacity → Auto Scaling

### EC2 with Auto Scaling Group

1. **Create Launch Template**:

   - Include user data script to install Node.js and deploy app

2. **Create Auto Scaling Group**:

   - Set min/max instances
   - Configure scaling policies based on CPU/memory

### ECS

1. **Configure Service Auto Scaling**:

   ```bash
   # macOS/Linux
   aws application-autoscaling register-scalable-target \
     --service-namespace ecs \
     --scalable-dimension ecs:service:DesiredCount \
     --resource-id service/arcline-cluster/arcline-server \
     --min-capacity 1 \
     --max-capacity 10
   ```

   ```powershell
   # Windows (PowerShell)
   aws application-autoscaling register-scalable-target `
     --service-namespace ecs `
     --scalable-dimension ecs:service:DesiredCount `
     --resource-id service/arcline-cluster/arcline-server `
     --min-capacity 1 `
     --max-capacity 10
   ```

## Troubleshooting

### ECS Service-Linked Role Missing

**Error: "Unable to assume the service linked role. Please verify that the ECS service linked role exists."**

This error occurs when the ECS service-linked role doesn't exist in your AWS account. This role is required for ECS to create clusters and manage resources.

**Solution**:

1. **Create the ECS service-linked role**:

   ```bash
   # macOS/Linux/Windows (same command)
   aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com
   ```

   If the role already exists, you'll get an error saying so - that's fine, the role is already there.

2. **Verify the role exists**:

   ```bash
   aws iam get-role --role-name AWSServiceRoleForECS
   ```

3. **Delete the failed stack** (if it's in ROLLBACK_COMPLETE state):

   ```bash
   aws cloudformation delete-stack --stack-name arcline-server

   # Wait for deletion to complete
   aws cloudformation wait stack-delete-complete --stack-name arcline-server
   ```

4. **Redeploy**:

   ```bash
   sam build
   sam deploy --guided
   ```

**Note**: The ECS service-linked role is automatically created when you first use ECS through the AWS Console, but not always when using CloudFormation/SAM. Creating it manually ensures it exists before deployment.

### TaskDefinition Creation Failed

**Error: "The following resource(s) failed to create: [TaskDefinition]"**

This error occurs when the ECS TaskDefinition resource fails to create. Common causes and solutions:

**1. Get Detailed Error Information**:

First, get the specific error message:

```bash
# macOS/Linux/Windows (same command)
aws cloudformation describe-stack-events --stack-name arcline-server --query "StackEvents[?ResourceType=='AWS::ECS::TaskDefinition' && ResourceStatus=='CREATE_FAILED']" --output table
```

Or get all failed events:

```bash
aws cloudformation describe-stack-events --stack-name arcline-server --query "StackEvents[?ResourceStatus=='CREATE_FAILED']" --output table
```

**2. Invalid Image URI**:

The ImageUri parameter must point to an existing image in ECR.

**Check if the image exists**:

```bash
# Verify the image exists in ECR
aws ecr describe-images --repository-name arcline-server --image-ids imageTag=latest --region us-east-1
```

**Solution**: Make sure you've:

- Built and pushed the Docker image to ECR (Step 2)
- Used the correct image URI format: `<account-id>.dkr.ecr.<region>.amazonaws.com/<repository-name>:<tag>`
- The image exists in the same region as your stack
- The image URI includes the `:latest` tag (or whatever tag you used)

**3. Invalid CPU/Memory Combination**:

Fargate has specific CPU and memory combinations. The template uses:

- CPU: 256
- Memory: 512 MB

This is a valid combination. If you modified these values, ensure they match a valid Fargate combination.

**4. Missing or Invalid Environment Variables**:

All environment variables must be provided and valid.

**Solution**: Verify all parameters were entered correctly during `sam deploy --guided`:

- ImageUri: Must be a valid ECR image URI with tag (e.g., `508767886604.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest`)
- Domain: Can be a placeholder for initial deployment
- SupabaseUrl: Must be a valid URL starting with `https://`
- SupabaseAnonKey: Must be a valid key
- TwilioAccountSid: Must be a valid SID starting with `AC` or `SK`
- TwilioAuthToken: Must be a valid token

**5. Stack Update Failed - Replacement Not Supported with Disable-Rollback**:

**Error: "Replacement type updates not supported on stack with disable-rollback"**

This occurs when you try to update a resource that requires replacement (like TaskDefinition) but the stack has automatic rollback disabled.

**Solution Options**:

**Option A: Enable Rollback and Update** (Recommended):

```bash
# Update stack to enable rollback
aws cloudformation update-termination-protection --stack-name arcline-server --no-enable-termination-protection

# Then update the stack normally
sam build
sam deploy
```

**Option B: Delete and Redeploy**:

```bash
# Delete the failed stack
aws cloudformation delete-stack --stack-name arcline-server

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete --stack-name arcline-server

# Redeploy
sam build
sam deploy --guided
```

**Option C: Manual Rollback**:

```bash
# Rollback to previous state
aws cloudformation rollback-stack --stack-name arcline-server

# Wait for rollback to complete
aws cloudformation wait stack-rollback-complete --stack-name arcline-server

# Then update with changes that don't require replacement
sam build
sam deploy
```

**Note**: TaskDefinition updates often require replacement. If you need to update it, consider deleting and recreating the stack, or make the changes in a way that doesn't require replacement (e.g., update environment variables without changing the task definition structure).

**6. Missing Execution Role (Most Common)**:

**Error: "Fargate requires task definition to have execution role ARN to support log driver awslogs"**

This error occurs when the TaskDefinition is missing the `ExecutionRoleArn` property, which is required for CloudWatch Logs.

**Solution**: The template.yaml has been updated to include the TaskExecutionRole. If you're using an older version of the template, update it to include:

```yaml
TaskExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: "2012-10-17"
      Statement:
        - Effect: Allow
          Principal:
            Service: ecs-tasks.amazonaws.com
          Action: sts:AssumeRole
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

TaskDefinition:
  Type: AWS::ECS::TaskDefinition
  Properties:
    # ... other properties ...
    ExecutionRoleArn: !Ref TaskExecutionRole
```

Then redeploy:

```bash
sam build
sam deploy --guided
```

**7. Common Image URI Issues**:

- ❌ Wrong: `508767886604.dkr.ecr.us-east-1.amazonaws.com/arcline-server` (missing tag)
- ✅ Correct: `508767886604.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest`
- ❌ Wrong: `arcline-server:latest` (missing ECR registry)
- ✅ Correct: `<account-id>.dkr.ecr.<region>.amazonaws.com/arcline-server:latest`

**Note**: I also noticed in your error that the Image URI is missing the `:latest` tag. Make sure to include it when prompted during `sam deploy --guided`.

### Docker Desktop Not Running (Windows)

**Error: "error during connect: Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/\_ping": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified."**

This error occurs when Docker Desktop is not running on Windows.

**Solution**:

1. **Start Docker Desktop**:

   - Open Docker Desktop from the Start menu or system tray
   - Wait for Docker Desktop to fully start (the whale icon in the system tray should be steady, not animating)
   - You'll see "Docker Desktop is running" when it's ready

2. **Verify Docker is running**:

   ```powershell
   # Windows (PowerShell)
   docker ps
   ```

   If Docker is running, this command should execute without errors (even if it shows no containers).

3. **If Docker Desktop won't start**:
   - Check if virtualization is enabled in BIOS
   - Ensure WSL 2 is installed and updated (Docker Desktop on Windows requires WSL 2)
   - Restart your computer
   - Reinstall Docker Desktop if issues persist

**Note**: Docker Desktop must be running before executing any `docker` commands.

### Docker Push Issues

**Error: "'docker push' requires 1 argument" or "docker push [OPTIONS] NAME[:TAG]"**

This error occurs when you try to push the wrong image tag or provide multiple arguments.

**Common mistakes**:

```bash
# ❌ WRONG - Trying to push local tag (won't work for ECR)
docker push arcline-server:latest

# ❌ WRONG - Providing multiple arguments
docker push arcline-server:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest

# ✅ CORRECT - Push the ECR-tagged image
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest
```

**Solution**: Always push the ECR-tagged image (the one with the full ECR repository URL), not the local tag. The workflow is:

1. Build with a local tag: `docker build -t arcline-server .`
2. Tag with ECR URL: `docker tag arcline-server:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest`
   - **Important**: Make sure to include the forward slash (`/`) between the ECR URL and the image name
   - ❌ Wrong: `docker tag arcline-server:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com arcline-server:latest`
   - ✅ Correct: `docker tag arcline-server:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest`
3. Push the ECR-tagged image: `docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/arcline-server:latest`

**Error: "tag does not exist"**: This occurs when the `docker tag` command fails or wasn't run correctly. Make sure:

- The source image exists (check with `docker images`)
- The ECR URL format is correct (includes `/` before the image name)
- You've logged into ECR first

**Note**: The `docker tag` command doesn't create a new image - it creates a new tag pointing to the same image. You need to push the tag that includes the ECR repository URL.

### Docker/ECR Login Issues

**Error: "unauthorized: incorrect username or password" or "Get https://registry-1.docker.io/v2/": unauthorized**

This error occurs when the ECR registry URL is missing from the `docker login` command. Docker defaults to Docker Hub instead of ECR.

**Solution**: Make sure to include the full ECR registry URL in your docker login command:

```bash
# ❌ WRONG - Missing ECR registry URL
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin

# ✅ CORRECT - Includes ECR registry URL
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com
```

**To get your ECR registry URL**:

```bash
# Get your AWS account ID
aws sts get-caller-identity --query Account --output text

# Your ECR registry URL format: <account-id>.dkr.ecr.<region>.amazonaws.com
# Example: 123456789012.dkr.ecr.us-east-1.amazonaws.com
```

**PowerShell (Windows)**:

```powershell
# Get your AWS account ID
aws sts get-caller-identity --query Account --output text

# Store password and login
$password = aws ecr get-login-password --region us-east-1
$password | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com
```

### WebSocket Connection Issues

**Error: "Unable to connect to 'url'" (Twilio Error 64102) or "Reached a number that is not equipped for incoming service" (Error 5B1)**

These errors occur when Twilio cannot establish a WebSocket connection to your server. The TwiML response is correct (200 OK), but the WebSocket handshake fails.

**CRITICAL ISSUE: HTTPS/WSS Required (Same as ngrok)**

Your server code uses `wss://` in production (same as your ngrok setup at `https://ross-phantastic-autonomously.ngrok-free.dev`), but AWS ALB requires HTTPS to be explicitly configured. Unlike ngrok which provides HTTPS automatically, AWS ALB needs:

1. **An HTTPS listener on port 443**
2. **An SSL certificate from AWS Certificate Manager (ACM)**

**Solution: Configure HTTPS on AWS ALB (to match ngrok setup)**

To match your ngrok setup (which provides HTTPS automatically), you need to configure HTTPS on AWS:

**Step 1: Get a Custom Domain and SSL Certificate**

1. **Get a custom domain** (e.g., `api.yourdomain.com`) - you can use any domain you own
2. **Request an ACM certificate**:

   ```bash
   # Request a certificate (requires domain ownership verification)
   aws acm request-certificate \
     --domain-name api.yourdomain.com \
     --validation-method DNS \
     --region us-east-1
   ```

3. **Validate the certificate** - ACM will provide DNS records to add to your domain. Add them to your DNS provider.

   **IMPORTANT: DNS Validation CNAME Record Format for Vercel**

   ACM will show a CNAME record like:

   - **CNAME name:** `_984c86909b8fafe12106e4d77a57f719.arcline.jasonrundell.com.` (with trailing dot)
   - **CNAME value:** `_3a8319ec8d76142f2b6dcf34841e2277.jkddzztszm.acm-validations.aws.` (with trailing dot)

   **In Vercel DNS settings:**

   - **Name:** `_984c86909b8fafe12106e4d77a57f719.arcline` (the full subdomain WITHOUT the root domain and trailing dot)
   - **Type:** `CNAME`
   - **Value:** `_3a8319ec8d76142f2b6dcf34841e2277.jkddzztszm.acm-validations.aws.` (WITH the trailing dot)
   - **TTL:** `60` (or auto)

   **Key points:**

   - Vercel automatically appends your root domain (`jasonrundell.com`) to the Name field
   - So if ACM shows `_xxx.arcline.jasonrundell.com.`, enter `_xxx.arcline` in Vercel
   - The Value MUST include the trailing dot (`.`)
   - Wait 5-10 minutes for DNS propagation, then ACM will validate automatically

4. **Wait for validation** - It can take 5-10 minutes for DNS to propagate and ACM to validate. Check the ACM console - the status will change from "Pending validation" to "Issued" when successful.

5. **Get the certificate ARN** (once validated):

   ```bash
   aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[?DomainName=='api.yourdomain.com'].CertificateArn" --output text
   ```

**Step 2: Update template.yaml (Already Updated)**

The template.yaml has been updated to support HTTPS. When you deploy, provide the certificate ARN:

```bash
cd server
sam build
sam deploy --guided
# When prompted:
# - SSLCertificateArn: <your-acm-certificate-arn>
# - Domain: api.yourdomain.com (your custom domain)
```

**Step 3: Point Domain to ALB**

1. **Get your ALB DNS name**:

   ```bash
   aws elbv2 describe-load-balancers --names arcline-alb --query "LoadBalancers[0].DNSName" --output text
   ```

2. **Create a CNAME record** in your DNS provider:
   - Name: `api` (or your subdomain)
   - Value: `<alb-dns-name>` (from step 1)
   - TTL: 300

**Step 4: Update Twilio Webhook**

Update your Twilio webhook URL to use your custom domain:

- Old: `http://arcline-alb-1106710197.us-east-1.elb.amazonaws.com/twiml`
- New: `https://api.yourdomain.com/twiml`

**Note:** The server code already uses `wss://` in production (same as ngrok), so once HTTPS is configured on the ALB, it will work exactly like your ngrok setup.

**Common causes:**

**1. Load Balancer Not Configured for WebSocket**:

The Application Load Balancer needs specific configuration for WebSocket connections. Check your template.yaml includes:

```yaml
TargetGroup:
  Type: AWS::ElasticLoadBalancingV2::TargetGroup
  Properties:
    # ... other properties ...
    HealthCheckPath: /health
    # Important: No specific WebSocket config needed - ALB handles it automatically
```

**Verify the target group health check**:

```bash
# Get target group ARN
aws elbv2 describe-target-groups --names arcline-tg --query "TargetGroups[0].TargetGroupArn" --output text

# Check target health
aws elbv2 describe-target-health --target-group-arn <target-group-arn>
```

If targets are unhealthy, check ECS service logs.

**2. Security Groups Blocking WebSocket**:

Verify security groups allow traffic on port 8080:

```bash
# Check security group rules
aws ec2 describe-security-groups --filters "Name=group-name,Values=arcline-server-sg" --query "SecurityGroups[0].IpPermissions"
```

The security group should allow:

- Inbound: Port 8080 from the ALB security group
- Outbound: All traffic (for CloudWatch Logs, etc.)

**3. ECS Service Not Running**:

Check if the ECS service is running and tasks are healthy:

```bash
# Get service status
aws ecs describe-services --cluster arcline-cluster --services arcline-server --query "services[0].{Status:status,RunningCount:runningCount,DesiredCount:desiredCount}"

# List running tasks
aws ecs list-tasks --cluster arcline-cluster --service-name arcline-server
```

If no tasks are running, check ECS service events:

```bash
aws ecs describe-services --cluster arcline-cluster --services arcline-server --query "services[0].events[0:5]"
```

**4. Check Application Logs**:

View CloudWatch logs to see if the server is receiving requests:

```bash
# macOS/Linux - Get recent log streams
aws logs describe-log-streams --log-group-name /ecs/arcline-server --order-by LastEventTime --descending --max-items 5

# macOS/Linux - View recent logs
aws logs tail /ecs/arcline-server --follow
```

```powershell
# Windows (PowerShell) - Use quotes to prevent path interpretation
aws logs describe-log-streams --log-group-name "/ecs/arcline-server" --order-by LastEventTime --descending --max-items 5

# Windows (PowerShell) - View recent logs (use quotes)
aws logs tail "/ecs/arcline-server" --follow
```

```bash
# Windows (Git Bash) - Use MSYS_NO_PATHCONV to prevent path conversion
MSYS_NO_PATHCONV=1 aws logs describe-log-streams --log-group-name /ecs/arcline-server --order-by LastEventTime --descending --max-items 5

# Windows (Git Bash) - View recent logs (use MSYS_NO_PATHCONV)
MSYS_NO_PATHCONV=1 aws logs tail /ecs/arcline-server --follow

# Alternative: Use quotes with explicit escaping
aws logs describe-log-streams --log-group-name '//ecs/arcline-server' --order-by LastEventTime --descending --max-items 5
```

**Note**:

- On Windows PowerShell, use quotes: `"/ecs/arcline-server"`
- On Windows Git Bash, use `MSYS_NO_PATHCONV=1` prefix or double slash: `'//ecs/arcline-server'`
- Git Bash interprets `/ecs/` as a Windows path (`C:/Program Files/Git/ecs/`), so you need to prevent path conversion

**5. Load Balancer Idle Timeout**:

WebSocket connections require a longer idle timeout. Update the load balancer:

```bash
# macOS/Linux - Get load balancer ARN and update
LB_ARN=$(aws elbv2 describe-load-balancers --names arcline-alb --query "LoadBalancers[0].LoadBalancerArn" --output text)
aws elbv2 modify-load-balancer-attributes \
  --load-balancer-arn "$LB_ARN" \
  --attributes Key=idle_timeout.timeout_seconds,Value=60
```

```powershell
# Windows (PowerShell) - Get load balancer ARN and update
$lbArn = aws elbv2 describe-load-balancers --names arcline-alb --query "LoadBalancers[0].LoadBalancerArn" --output text
aws elbv2 modify-load-balancer-attributes `
  --load-balancer-arn $lbArn `
  --attributes Key=idle_timeout.timeout_seconds,Value=60
```

```bash
# Windows (Git Bash) - Get load balancer ARN and update
LB_ARN=$(aws elbv2 describe-load-balancers --names arcline-alb --query "LoadBalancers[0].LoadBalancerArn" --output text)
aws elbv2 modify-load-balancer-attributes \
  --load-balancer-arn "$LB_ARN" \
  --attributes Key=idle_timeout.timeout_seconds,Value=60
```

Or add to your template.yaml (requires stack update):

```yaml
LoadBalancer:
  Type: AWS::ElasticLoadBalancingV2::LoadBalancer
  Properties:
    # ... existing properties ...
    LoadBalancerAttributes:
      - Key: idle_timeout.timeout_seconds
        Value: 60
```

**6. Test WebSocket Endpoint Directly**:

Test if the WebSocket endpoint is accessible:

```bash
# Test HTTP endpoint first
curl http://arcline-alb-1106710197.us-east-1.elb.amazonaws.com/health

# Test WebSocket endpoint (requires wscat or similar tool)
# Install wscat: npm install -g wscat
wscat -c ws://arcline-alb-1106710197.us-east-1.elb.amazonaws.com/ws
```

**Note**: The endpoint should use `ws://` for testing (not `wss://`), but Twilio requires `wss://` in production.

**7. Domain/URL Configuration**:

Verify the DOMAIN environment variable matches your load balancer DNS:

```bash
# Get current stack parameters
aws cloudformation describe-stacks --stack-name arcline-server --query "Stacks[0].Parameters"
```

The DOMAIN should be: `arcline-alb-1106710197.us-east-1.elb.amazonaws.com`

If it's different, update it:

```bash
aws cloudformation update-stack \
  --stack-name arcline-server \
  --use-previous-template \
  --parameters \
    ParameterKey=Domain,ParameterValue=arcline-alb-1106710197.us-east-1.elb.amazonaws.com \
    ParameterKey=ImageUri,UsePreviousValue=true \
    ParameterKey=SupabaseUrl,UsePreviousValue=true \
    ParameterKey=SupabaseAnonKey,UsePreviousValue=true \
    ParameterKey=TwilioAccountSid,UsePreviousValue=true \
    ParameterKey=TwilioAuthToken,UsePreviousValue=true
```

**8. Verify ECS Task is Running**:

```bash
# Get task details
aws ecs list-tasks --cluster arcline-cluster --service-name arcline-server

# Describe the task (replace <task-arn> with actual ARN)
aws ecs describe-tasks --cluster arcline-cluster --tasks <task-arn>
```

Check that:

- Task status is "RUNNING"
- Last status is "RUNNING"
- Container is healthy (if health checks are configured)

**Quick Checklist**:

- [x] ECS service is running with desired count > 0 ✅ (You have 1 task running)
- [x] Tasks are in RUNNING state ✅ (Task exists)
- [x] Target group health checks are passing ✅ (Target is healthy)
- [ ] Security groups allow traffic from ALB to ECS tasks (Check this)
- [ ] Load balancer idle timeout is at least 60 seconds (May need to update)
- [ ] DOMAIN environment variable matches load balancer DNS (Check this)
- [ ] Application logs show server is starting correctly (Check logs with correct command below)
- [ ] Health endpoint (`/health`) is accessible (Test this)

**Since your tasks are running and targets are healthy, the WebSocket connection issue is likely:**

1. ✅ **Load balancer idle timeout** - Already updated to 60 seconds
2. ✅ **Security group** - Already configured correctly (allows ALB → ECS traffic)
3. **Application not handling WebSocket upgrades** - Check logs to see if WebSocket upgrade requests are reaching the server
4. **HTTPS/WSS requirement** - Twilio requires `wss://` (secure WebSocket) but your load balancer only has HTTP (port 80), not HTTPS (port 443)

**Immediate Diagnostic Steps:**

1. **Check logs (Windows PowerShell - use quotes)**:

   ```powershell
   aws logs tail "/ecs/arcline-server" --follow
   ```

2. **Test health endpoint**:

   ```powershell
   curl http://arcline-alb-1106710197.us-east-1.elb.amazonaws.com/health
   ```

3. **Update load balancer idle timeout**:

   ```powershell
   $lbArn = aws elbv2 describe-load-balancers --names arcline-alb --query "LoadBalancers[0].LoadBalancerArn" --output text
   aws elbv2 modify-load-balancer-attributes --load-balancer-arn $lbArn --attributes Key=idle_timeout.timeout_seconds,Value=60
   ```

4. **Check security group rules**:
   ```powershell
   aws ec2 describe-security-groups --filters "Name=group-name,Values=arcline-server-sg" --query "SecurityGroups[0].IpPermissions"
   ```

### High Latency

- Check CloudWatch metrics for instance performance
- Consider using Application Load Balancer with connection draining
- Enable CloudFront for static assets (if applicable)

### Deployment Failures

- Check CloudWatch logs for build errors
- Verify all environment variables are set correctly
- Ensure Node.js version matches (18+)

## Cost Optimization

1. **Use Reserved Instances** (for EC2/Elastic Beanstalk):

   - Save up to 75% compared to on-demand

2. **Right-size Instances**:

   - Monitor usage and adjust instance types
   - Use Spot Instances for non-critical workloads

3. **Use Fargate Spot** (for ECS):

   - Save up to 70% compared to regular Fargate

4. **Enable Auto Scaling**:
   - Scale down during low traffic periods

## Production Checklist

- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] Twilio webhook configured
- [ ] Health endpoint responding
- [ ] TwiML endpoint returning valid XML
- [ ] Test calls working
- [ ] SSL certificate installed
- [ ] Monitoring and alerts configured
- [ ] Auto-scaling configured
- [ ] Backup strategy in place
- [ ] Security groups configured
- [ ] CloudWatch logging enabled
