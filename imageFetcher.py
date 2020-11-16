import requests
import json
from bs4 import BeautifulSoup

PSN_PROFILES_URL = "https://psnprofiles.com/trophies"
PLATFORMS = ["ps3", "ps4", "ps5", "psvita"]


def getIconLinks(soup, icon_class):
    picture_tags = soup.find_all("picture", {"class": icon_class})
    game_icons = []

    for picture_tag in picture_tags:
        source_tag = picture_tag.findChildren("source", recursive=False)[0]
        image_link = source_tag["srcset"].split(" ")[1]
        game_icons.append(image_link)

    return game_icons


def fetchImageLinks(links, page, platform):
    headers = {"Content-type": "text"}
    params = {"platform": platform, "type": "platinum", "page": str(page)}
    r = requests.get(PSN_PROFILES_URL, headers=headers, params=params)
    if r.status_code != requests.codes.ok:
        return -1

    soup = BeautifulSoup(r.text, 'html.parser')
    games = getIconLinks(soup, "game")
    trophies = getIconLinks(soup, "trophy")

    for i in range(0, len(games)):
        game = games[i]
        trophy = trophies[i]
        game_id = game.split("/")[4]
        links[game_id] = {"gameIcon": game,
                          "icon": trophy, "platform": platform}


def writeLinksToFile():
    image_links = {}
    for platform in PLATFORMS:
        for page in range(1, 50):
            print(f"Fetching {platform}, page {page}...")
            if fetchImageLinks(image_links, page, platform) == -1:
                print(f"ERROR: {platform} failed on page {1}")
                return

    with open("src/assets/data/images.json", "w") as file:
        file.write(json.dumps(image_links))


writeLinksToFile()
