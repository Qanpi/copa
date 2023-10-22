module.exports = {
    "apps": [
        {
            "name": "copa",
            "script": "bin/www.js",
            "env_production": {
                "NODE_ENV": "production",
                "DEBUG": "app:*"
            }
        }
    ]
}