const os = require('os');

const envVariables = {
    port: process.env.service_port || 5000,
    threads: process.env.service_threads || os.cpus().length,
    azureAccountName: process.env.sunbird_azure_account_name,
    azureAccountKey: process.env.sunbird_azure_account_key,
    azureContainerName: process.env.sunbird_azure_container_name || "sunbird-content-dev",
    level: process.env.service_log_level || 'info',
    encodingType: process.env.service_encoding_type,
    filename: process.env.service_file_filename || 'print-service-%DATE%.log'
}
module.exports = envVariables;