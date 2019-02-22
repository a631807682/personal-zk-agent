const live = require('../index');
const config = require('./config');

live(config).then(() => {
    console.log('live stop')
}).catch((error) => {
    console.log('live error', error);
})

process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
    process.exit(1);
})