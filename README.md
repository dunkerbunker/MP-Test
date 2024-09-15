
## Setup
Create DB with below schema

```sql
CREATE TABLE IF NOT EXISTS RECOMMENDATION (
  `DAY` INT,
  recno INT,
  bundle_price DECIMAL(10, 2),
  data_volume INT,
  data_validity INT,
  data_price DECIMAL(10, 2),
  onnet_min INT,
  onnet_validity INT,
  onnet_price DECIMAL(10, 2),
  local_min INT,
  local_valiidity INT,
  local_price DECIMAL(10, 2),
  sms INT,
  sms_validity INT,
  sms_price DECIMAL(10, 2),
  package_name VARCHAR(255),
  package_Verbage TEXT,
  Short_Desc VARCHAR(255),
  Ribbon_text VARCHAR(255),
  Giftpack VARCHAR(255),
  mageypackid VARCHAR(255)
);

-- Create users table
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE, -- Reduced length
  `password` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE `sessions` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `sessionToken` VARCHAR(191) NOT NULL UNIQUE, -- Reduced length
  `userId` INT NOT NULL,
  `expiresAt` DATETIME NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);


CREATE TABLE `operation_logs` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `operation` VARCHAR(255) NOT NULL,
  `tableName` VARCHAR(255) NOT NULL,
  `recordId` INT,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
```

Create a `.env` file in the root directory and add the following environment variables:
Each theme and values can be modified as needed.
```bash
# Base
DATABASE_URL="mysql://root@localhost:3306/manta_db"
RECOMMENDATION_TABLE_NAME="recommendation"
USER_TABLE_NAME="users"
RECOMMENDATION_LOG_TABLE_NAME="recommendation_logs"
SESSION_TABLE_NAME="sessions"

# color scheme
NEXT_PUBLIC_PRIMARY_COLOR='#ff0000'
NEXT_PUBLIC_SECONDARY_COLOR='#ffffff'

# Filter values
NEXT_PUBLIC_MIN_BUNDLE_PRICE=0
NEXT_PUBLIC_MAX_BUNDLE_PRICE=1000
NEXT_PUBLIC_BUNDLE_PRICE_STEP=5

NEXT_PUBLIC_MIN_DATA_VOLUME_MB=0
NEXT_PUBLIC_MAX_DATA_VOLUME_MB=102400
NEXT_PUBLIC_DATA_VOLUME_STEP_MB=100
NEXT_PUBLIC_MIN_DATA_VOLUME_GB=0
NEXT_PUBLIC_MAX_DATA_VOLUME_GB=100
NEXT_PUBLIC_DATA_VOLUME_STEP_GB=0.1

NEXT_PUBLIC_MIN_ONNET_MIN=0
NEXT_PUBLIC_MAX_ONNET_MIN=45000
NEXT_PUBLIC_ONNET_MIN_STEP=100

NEXT_PUBLIC_MIN_LOCAL_MIN=0
NEXT_PUBLIC_MAX_LOCAL_MIN=45000
NEXT_PUBLIC_LOCAL_MIN_STEP=100

NEXT_PUBLIC_MIN_VALIDITY_DAYS=0
NEXT_PUBLIC_MAX_VALIDITY_DAYS=365
```

## Running the project
First, run prisma generate to generate the prisma client
```
npx prisma generate
```

Then, run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
