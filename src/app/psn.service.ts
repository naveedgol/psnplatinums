import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
    return this.http.get('./assets/data/profile.html', options);
    // return this.http.get(this.psnUrl + psn_id + '?completion=platinum', options);
  }

  parseCount(doc, trophyClass) {
    return parseInt(doc.querySelectorAll("li." + trophyClass)[0].innerText.trim().replace(/,/g, ''));
  }

  parseUser(data, psn_id) {
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(data, "text/html");

    var user = new User();
    user.id = psn_id;
    user.bronzeCount = this.parseCount(doc, "bronze");
    user.silverCount = this.parseCount(doc, "silver");
    user.goldCount = this.parseCount(doc, "gold");
    user.platinumCount = this.parseCount(doc, "platinum");
    user.level = parseInt((doc.querySelectorAll("li.icon-sprite.level")[0] as HTMLElement).innerText);
    user.avatar = doc.getElementsByTagName("img")[6].src;
    return user;
  }

  parsePlats(data) {
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(data, "text/html");
    const titles = doc.querySelectorAll("a.title");
    const icons = doc.querySelectorAll("img.trophy");
    const games = doc.querySelectorAll("img.game");
    const nums = doc.querySelectorAll("b");
    // const rarities = doc.querySelectorAll("span.typo-top");

    const plats = [];

    for (var i = 0; i < titles.length; ++i) {
      var trophy = new PlatinumTrophy();
      trophy.name = (titles[i] as HTMLElement).innerText;
      // trophy.rarity = games[i].innerText;
      trophy.icon = (icons[i] as HTMLImageElement).src;
      trophy.game = (games[i] as HTMLElement).title;
      trophy.gameIcon = (games[i] as HTMLImageElement).src;
      trophy.num = parseInt(nums[i].innerText.substring(1).replace(/,/g, ''))
      plats.push(trophy);
    }

    console.log(plats);
    return plats;
  }

  getPlatinums(psn_id, pageCount) {
    const options = {
      headers: { 'accept': 'text/html' },
      params: { 'type': 'platinum', 'page': pageCount },
      responseType: 'text' as const
    };
    // return this.http.get(this.psnUrl + psn_id + "/log", options);
    return this.http.get('./assets/data/platpage' + pageCount + '.html', options);
  }

}