## arg1 = path
## arg2 = branch

cd $1
git checkout $2
git reset --hard origin/$2
git pull
pm2 restart 0