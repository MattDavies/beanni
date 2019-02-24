import { BankDataProviderInterface, FassInstitutionRelationship, AccountBalance } from './types';
import fs = require('fs');
import yaml = require('yaml');
import { SecretStore } from './secretStore';
import { DataStore } from './dataStore';

interface FassConfig
{
    relationships: Array<FassInstitutionRelationship>;
}

export interface FassExecutionContext
{
    debug: boolean;
}

const CONFIG_PATH = './config.yaml';

export class Core
{
    dataStore: DataStore;
    secretStore: SecretStore;

    constructor(dataStore: DataStore, secretStore: SecretStore) {
        this.dataStore = dataStore;
        this.secretStore = secretStore;
    }

    async loadConfig() : Promise<FassConfig> {
        const configFileText = fs.readFileSync(CONFIG_PATH, 'utf8');
        let config = <FassConfig>yaml.parse(configFileText);
        return config;
    }

    async validateConfig() {
        let config = await this.loadConfig();
        console.log(JSON.stringify(config));
    }

    async fetch(executionContext:FassExecutionContext) {
        const config = await this.loadConfig();
        console.log('%s relationships to fetch from', config.relationships.length)

        const balances = new Array<AccountBalance>();

        try
        {
            await this.dataStore.open();

            for (const relationship of config.relationships) {
                console.log('Fetching \'%s\' via \'%s\'', relationship.name, relationship.provider);
                const providerName = relationship.provider;
                var module = require('./providers/' + providerName);
                var provider = <BankDataProviderInterface>new module[providerName]();

                var retrieveSecretCallback = async (key : string) => {
                    return await this.secretStore.retrieveSecret(relationship.name + ':' + key);
                };

                var relationshipBalances = await provider.getBalances(relationship, executionContext, retrieveSecretCallback);
                console.log('Found %s accounts', relationshipBalances.length);
                relationshipBalances.forEach(b => {
                    balances.push(b);
                    this.dataStore.addBalance(b);
                });
            }

            console.log('Written %s balance entries to the data store', balances.length);
        }
        finally
        {
            await this.dataStore.close();
        }
    }

    async init(executionContext:FassExecutionContext) {
        try
        {
            await fs.promises.access(CONFIG_PATH, fs.constants.F_OK);
            console.error('There\'s already a config.yaml file on disk; leaving it as-is');
        }
        catch
        {
            await fs.promises.copyFile(
                __dirname + '/../src/example-config.yaml',
                CONFIG_PATH,
                fs.constants.COPYFILE_EXCL
            );
            console.log('Created config.yaml')
        }
    }
}
