ng build --prod --output-path docs --base-href /psn-trophy-case/
cp docs/index.html docs/404.html
git add -A 
git commit -m "rebuild site"
git push