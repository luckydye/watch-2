cd /srv/www/watch-2
git checkout master
git reset --hard origin/master
git pull
pm2 restart 0