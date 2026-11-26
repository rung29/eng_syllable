// Writing-based syllable divisions for the custom practice mode.
// Rows are grouped by topic and difficulty. Dots mark the accepted cut positions.
const DOJO_WORD_ROWS = {
  animals: [
    ['easy', `cat|貓
dog|狗
duck|鴨
fish|魚
frog|青蛙
sheep|羊
bird|鳥
rab.bit|兔子
pan.da|熊貓
ti.ger|老虎
spi.der|蜘蛛
kit.ten|小貓
pup.py|小狗
but.ter.fly|蝴蝶
kan.ga.roo|袋鼠
el.e.phant|大象
al.li.ga.tor|短吻鱷
cat.er.pil.lar|毛毛蟲`],
    ['medium', `whale|鯨魚
swan|天鵝
shrimp|蝦
crab|螃蟹
dol.phin|海豚
tur.tle|烏龜
pen.guin|企鵝
ham.ster|倉鼠
mon.key|猴子
ea.gle|老鷹
oct.o.pus|章魚
jel.ly.fish|水母
mos.qui.to|蚊子
ar.ma.dil.lo|犰狳
rhi.noc.er.os|犀牛`],
    ['hard', `lynx|猞猁
moth|蛾
trout|鱒魚
mink|水貂
os.trich|鴕鳥
lob.ster|龍蝦
bea.ver|河狸
liz.ard|蜥蜴
man.a.tee|海牛
pel.i.can|鵜鶘
por.cu.pine|豪豬
sal.a.man.der|蠑螈
or.ang.u.tan|紅毛猩猩`]
  ],
  food: [
    ['easy', `rice|米飯
bread|麵包
milk|牛奶
cake|蛋糕
pear|梨子
grape|葡萄
cheese|起司
ap.ple|蘋果
or.ange|柳橙
lem.on|檸檬
pan.cake|鬆餅
pop.corn|爆米花
ba.na.na|香蕉
to.ma.to|番茄
po.ta.to|馬鈴薯
wa.ter.mel.on|西瓜`],
    ['medium', `beef|牛肉
plum|李子
peach|桃子
soup|湯
oats|燕麥
hon.ey|蜂蜜
car.rot|胡蘿蔔
muf.fin|瑪芬蛋糕
yo.gurt|優格
sand.wich|三明治
av.o.ca.do|酪梨
cu.cum.ber|小黃瓜
pine.ap.ple|鳳梨
mac.a.ro.ni|通心麵
pep.per.o.ni|辣味臘腸`],
    ['hard', `squash|南瓜類蔬菜
prune|西梅乾
yam|山藥
thyme|百里香
tur.nip|蕪菁
sher.bet|果汁冰
mus.tard|芥末醬
vin.e.gar|醋
cel.er.y|芹菜
spa.ghet.ti|義大利麵
or.e.ga.no|奧勒岡
pis.ta.chi.o|開心果`]
  ],
  school: [
    ['easy', `book|書
pen|原子筆
desk|書桌
class|班級
map|地圖
bell|鈴
pa.per|紙
pen.cil|鉛筆
teach.er|老師
back.pack|後背包
home.work|回家作業
e.ras.er|橡皮擦
cal.en.dar|日曆
yes.ter.day|昨天
in.for.ma.tion|資訊
ed.u.ca.tion|教育`],
    ['medium', `chalk|粉筆
glue|膠水
chart|圖表
quiz|小考
note.book|筆記本
let.ter|字母
stu.dent|學生
scis.sors|剪刀
com.pu.ter|電腦
li.brar.y|圖書館
tel.e.phone|電話
dic.tion.ar.y|字典
ge.og.ra.phy|地理`],
    ['hard', `shelf|架子
draft|草稿
clamp|夾具
script|腳本
sub.ject|科目
sen.tence|句子
frac.tion|分數
gram.mar|文法
par.a.graph|段落
syll.a.ble|音節
il.lus.tra.tion|插圖
de.fin.i.tion|定義
cal.cu.la.tor|計算機`]
  ],
  daily: [
    ['easy', `bed|床
chair|椅子
door|門
room|房間
sock|襪子
shoe|鞋子
win.dow|窗戶
ta.ble|桌子
bot.tle|瓶子
pil.low|枕頭
um.brel.la|雨傘
neigh.bor.hood|社區
el.e.va.tor|電梯
tel.e.vi.sion|電視
cel.e.bra.tion|慶祝活動`],
    ['medium', `brush|刷子
sponge|海綿
stool|凳子
sink|水槽
blan.ket|毯子
cur.tain|窗簾
bas.ket|籃子
nap.kin|餐巾紙
a.part.ment|公寓
en.ve.lope|信封
dec.o.ra.tion|裝飾品
su.per.mar.ket|超級市場`],
    ['hard', `hinge|鉸鏈
slat|板條
latch|門閂
flask|保溫瓶
cup.board|櫥櫃
ket.tle|水壺
ham.per|洗衣籃
pan.try|食品儲藏室
fur.ni.ture|家具
con.tain.er|容器
gen.er.a.tor|發電機
ven.ti.la.tion|通風`]
  ],
  nature: [
    ['easy', `rain|雨
snow|雪
sun|太陽
moon|月亮
tree|樹
cloud|雲
rain.bow|彩虹
riv.er|河流
for.est|森林
moun.tain|山
wa.ter.fall|瀑布
vol.ca.no|火山
an.i.mal|動物
en.vi.ron.ment|環境`],
    ['medium', `pond|池塘
stream|溪流
leaf|葉子
seed|種子
is.land|島
o.cean|海洋
des.ert|沙漠
val.ley|山谷
hur.ri.cane|颶風
tor.na.do|龍捲風
at.mo.sphere|大氣
daff.o.dil|黃水仙
veg.e.ta.tion|植被`],
    ['hard', `cliff|懸崖
branch|樹枝
drought|乾旱
reef|礁
mud.slide|土石流
wet.land|濕地
land.slide|山崩
fos.sil|化石
av.a.lanche|雪崩
pen.in.su.la|半島
con.ser.va.tion|保育
con.den.sa.tion|凝結`]
  ],
  activities: [
    ['easy', `run|跑步
swim|游泳
jump|跳
draw|畫圖
dance|跳舞
sing|唱歌
base.ball|棒球
foot.ball|足球
pic.nic|野餐
skat.ing|溜冰
bas.ket.ball|籃球
vol.ley.ball|排球
hol.i.day|假期
gym.nas.tics|體操
com.pe.ti.tion|比賽`],
    ['medium', `climb|攀爬
stretch|伸展
race|賽跑
drum|打鼓
ten.nis|網球
soc.cer|足球
prac.tice|練習
paint.ing|繪畫
bad.min.ton|羽球
tram.po.line|彈翻床
ex.er.cise|運動
rec.re.a.tion|休閒活動
cham.pi.on.ship|錦標賽`],
    ['hard', `sprint|短跑
ski|滑雪
row|划船
fence|擊劍
arch.er.y|射箭
moun.tain.eer.ing|登山運動
pil.a.tes|皮拉提斯
bi.cy.cling|騎自行車
jug.gling|雜耍
mar.a.thon|馬拉松
tourn.a.ment|錦標賽
ac.ro.bat.ics|特技表演`]
  ]
};
