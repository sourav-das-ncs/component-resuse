/*
{
    "uid" : "P000078",
    "userUuid" : "bac6c6fe-11af-45f6-868e-6567869d2398",
    "resourceId" : "bac6c6fe-11af-45f6-868e-6567869d2398",
    "first_name" : "Ho Kim",
    "last_name" : "NG",
    "email" : "hokim.ng@asia.meap.com",
    "login_name" : "HKNG"
  }
 */
async function findUser(email) {
    const response = await fetch("https://a5e2bjyuh.accounts.ondemand.com/service/um?org=global&BasicAuthn=disabled", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
            "Accept": "text/plain, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            // replace for auth
            "X-CSRF-Token": "Fwe6pSVC7NDNC2kSa5N7T36H0xJnhCiUm3xAPNsZg7Q6MTcxMzc1MzQ2Mjk3MQ",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Priority": "u=1"
        },
        "referrer": "https://a5e2bjyuh.accounts.ondemand.com/",
        "body": `{\"search_pattern\":\"${email}\",\"size\":40,\"id\":\"initial\"}`,
        "method": "POST",
        "mode": "cors"
    });

    const data = await response.json()

    if (data.hasOwnProperty("users") && data.users.length > 0) {
        return data.users[0];
    }

    return null;
}

async function resetPassword(user) {
    const password = "Welcome@1234";
    const uid = user.uid;
    const response = await fetch("https://a5e2bjyuh.accounts.ondemand.com/service/users/statusPassword/new/?BasicAuthn=disabled", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-CSRF-Token": "Fwe6pSVC7NDNC2kSa5N7T36H0xJnhCiUm3xAPNsZg7Q6MTcxMzc1MzQ2Mjk3MQ",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Priority": "u=1"
        },
        "referrer": "https://a5e2bjyuh.accounts.ondemand.com/",
        "body": `{\"identifier\":\"mail\",\"mail\":\"${uid}\",\"password\":\"${password}\"}`,
        "method": "PUT",
        "mode": "cors"
    });
    console.log(response.status)
}


async function main() {
    for (let email of EMAILS) {
        const user = await findUser(email);
        if(user === null) {
            console.log("user not found", email);
            continue;
        }
        console.log(user);
        try {
            resetPassword(user);
        } catch (error) {
            console.error(error);
            console.log("password reset failed for", user);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

EMAILS = [
    "JinqShyan.Ng@asia.meap.com",
    "joyce.sumitha@asia.meap.com",
    "Karen.See@asia.meap.com",
    "Katherine.Tan@asia.meap.com",
    "Kathrine.Lee@asia.meap.com",
    "kelvin.loh@asia.meap.com",
    "Kenneth.Tong@asia.meap.com",
    "kienli.yew@asia.meap.com",
    "KaiSia.Lee@asia.meap.com",
    "KhengTiong.Low@asia.meap.com",
    "Leonggee.Aw@asia.meap.com",
    "LiKhuan.Tay@asia.meap.com",
    "LiLin.Kong@asia.meap.com",
    "LengLeng.Soh@asia.meap.com",
    "emme.eng@asia.meap.com",
    "Levinon.Nobrera@asia.meap.com",
    "Marcus.Yong@asia.meap.com",
    "mamidi.duryodhana@asia.meap.com",
    "maikee.gan@asia.meap.com",
    "MunLeng.Chua@asia.meap.com",
    "MongPing.Ng@asia.meap.com",
    "MeiQi.Tan@asia.meap.com",
    "Muisun.Chai@asia.meap.com",
    "MeiSum.Woo@asia.meap.com",
    "myintthuzar.khin@asia.meap.com",
    "Masanori.Yamada@asia.meap.com",
    "Nicholas.Hung@asia.meap.com",
    "Nigel.Ho@asia.meap.com",
    "Sofya.Nurul@asia.meap.com",
    "patrick.chu@asia.meap.com",
    "Pauline.Thng@asia.meap.com",
    "PengLeong.Ho@asia.meap.com",
    "Randy.Xu@asia.meap.com",
    "Royston.Kwik@asia.meap.com",
    "Sachin.As@asia.meap.com",
    "Samantha.Tan@asia.meap.com",
    "Sani.Saleh@asia.meap.com",
    "SiewFeng.Tan@asia.meap.com",
    "seonghong.lim@asia.meap.com",
    "SiewHuay.Ong@asia.meap.com",
    "SiangLiang.Sim@asia.meap.com",
    "SiewLian.Quek@asia.meap.com",
    "SoonLeng.Tan@asia.meap.com",
    "shiming.chua@asia.meap.com",
    "SiewPeng.Low@asia.meap.com",
    "Priscilla.Ong@asia.meap.com",
    "Steven.Teo@asia.meap.com",
    "virgilio.sanchez@asia.meap.com",
    "ShiaYin.Lim@asia.meap.com",
    "SinYee.Tham@asia.meap.com",
    "terence.liew@asia.meap.com",
    "Takahito.Noda@asia.meap.com",
    "Tom.Yong@asia.meap.com",
    "Tsutomu.Sekizawa@asia.meap.com",
    "TaiWei.Ng@asia.meap.com",
    "Winghong.Chui@asia.meap.com",
    "Wilfred.Cher@asia.meap.com",
    "Winston.Chin@asia.meap.com",
    "WaiMun.Leong@asia.meap.com",
    "WenMan.Wang@asia.meap.com",
    "WeePheng.Lau@asia.meap.com",
    "WeiSze.Lee@asia.meap.com",
    "WaiYin.Lee@asia.meap.com",
    "XinYi.Oh@asia.meap.com",
    "Yunita.Halim@asia.meap.com",
    "Abel.Neui@asia.meap.com",
    "Yuka.Iwasaki@asia.meap.com",
    "YiShan.Tan@asia.meap.com",
    "Yvonne.Chia@asia.meap.com",
    "YiYuan.Ng@asia.meap.com",
    "Zona.Liew@asia.meap.com",
]

main()


