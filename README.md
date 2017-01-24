migration-to-0.5.0
===

This is the migration tool for HackMD to upgrade to version 0.5.0.  
Use this tool if you were running a old version HackMD server.  
We'll uncompress note and revision data which were compressed by LZString.

Get started
---

1. Stop your server.
2. **Backup your DB**.
3. Install node (at least 4.2), and run `npm install`.
4. Change the db configs in `config.json`, [see more here](http://sequelize.readthedocs.io/en/latest/api/sequelize/).
5. Run the `app.js` as you need (in most case `node app.js` is enough), remember to keep the logs.
6. Wait for migration, will take more time if you have large amount of data. (if migration on Revisions table is slow, it might lacking of primary key on field `id`)
7. Complete!
