import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { retry } from 'rxjs/operators';
class PlatinumTrophy {
  name: string;
  rarity: number;
  icon: string;
  game: string;
  gameIcon: string;
  num: number;
}

export class User {
  id: string;
  bronzeCount: number;
  silverCount: number;
  goldCount: number;
  platinumCount: number;
  level: number;
  avatar: string;
  levelProgress: number;

  getTotalCount(): number {
    return this.bronzeCount + this.silverCount + this.goldCount + this.platinumCount;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PsnService {

  constructor(private http: HttpClient) { }

  psnUrl = 'https://cors-anywhere.herokuapp.com/https://psnprofiles.com/';

  getProfile(psn_id) {
    const options = {
      responseType: 'text' as const
    };
    // return this.http.get('./assets/data/profile.html', options);
    return this.http.get(this.psnUrl + psn_id + '?completion=platinum', options).pipe(retry(10));
  }

  parseCount(doc, trophyClass) {
    return parseInt(doc.querySelectorAll("li." + trophyClass)[0].innerText.trim().replace(/,/g, ''));
  }

  parseUser(data, psn_id) {
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(data, "text/html");
    if (doc.getElementById("update-find")) {
      return undefined;
    }
    var user = new User();
    user.id = psn_id;
    user.bronzeCount = this.parseCount(doc, "bronze");
    user.silverCount = this.parseCount(doc, "silver");
    user.goldCount = this.parseCount(doc, "gold");
    user.platinumCount = this.parseCount(doc, "platinum");
    user.level = parseInt((doc.querySelectorAll("li.icon-sprite.level")[0] as HTMLElement).innerText);
    user.avatar = doc.getElementsByTagName("img")[6].src;
    var levelProgress = doc.querySelector("div.progress-bar").childNodes[1].textContent.substring(6, 8);
    if (levelProgress[1] === '%') {
      levelProgress = levelProgress.substring(0, 1);
    }
    user.levelProgress = parseInt(levelProgress);
    return user;
  }

  parsePlats(data) {
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(data, "text/html");
    const titles = doc.querySelectorAll("a.title");
    const icons = doc.querySelectorAll("img.trophy");
    const games = doc.querySelectorAll("img.game");
    const nums = doc.querySelectorAll("b");
    const rarities = Array.from(doc.querySelectorAll("span.typo-top")).filter(x => (x as HTMLElement).innerText.slice(-1) === '%');

    const plats = [];

    for (var i = 0; i < titles.length; ++i) {
      var trophy = new PlatinumTrophy();
      trophy.name = (titles[i] as HTMLElement).innerText;
      // trophy.rarity = games[i].innerText;
      trophy.icon = (icons[i] as HTMLImageElement).src;
      trophy.game = (games[i] as HTMLElement).title;
      trophy.gameIcon = (games[i] as HTMLImageElement).src;
      trophy.num = parseInt(nums[i].innerText.substring(1).replace(/,/g, ''));
      trophy.rarity = parseFloat((rarities[i] as HTMLElement).innerText);
      plats.push(trophy);
    }

    // console.log(plats);
    return plats;
  }

  getPlatinums(psn_id, pageCount) {
    const options = {
      headers: { 'accept': 'text/html' },
      params: { 'type': 'platinum', 'page': pageCount },
      responseType: 'text' as const
    };
    return this.http.get(this.psnUrl + psn_id + "/log", options).pipe(retry(10));
    // return this.http.get('./assets/data/platpage' + pageCount + '.html', options);
  }

}