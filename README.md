migration-to-0.5.0
===

This is the migration tool for HackMD to upgrade to version 0.5.0.  
Use this tool if you were running a old version HackMD server.  
We'll uncompress note and revision data which were compressed by LZString.

Get started
---

1. Install node (at least 4.2), and run `npm install`.
2. Copy `config.json.example` to `config.json`
3. Change the db configs in `config.json`, [see more here](http://sequelize.readthedocs.io/en/latest/api/sequelize/)
4. run the `app.js` as you like (in most case `node app.js` is enough)
5. Wait for migration, will take more time if you have large amount of data.
6. Complete!
