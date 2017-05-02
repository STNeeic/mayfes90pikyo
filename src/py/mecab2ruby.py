#mecabから出力された文章に対して、漢字に所望のrubyタグを付けて出力する。

import re
import jaconv as ja

kana = re.compile('^[あ-んア-ン0-9a-zA-Zー〜、。「」『』！]+$')

while True:
    str = input()
    if str == "EOS":
        break
    data = re.split('[\s,]', str)
    if kana.fullmatch(data[0]) == None:
        #この時漢字が含まれているはず
        #漢字の部分だけをrubyでくくりたいので漢字を探す
        hiragana = ja.kata2hira(data[8])
        offs = 0
        index = 0
        while index < len(data[0]):
            if kana.match(data[0][index]) == None:
                #基本的に漢字がかなより長くなることはないと仮定する。
                #又、漢字の読みとそのあとの読みは異なると仮定する。
                i = 1
                now = 1
                while index + i < len(data[0]) and kana.match(data[0][index + i]) == None:
                    i += 1
                if index + i < len(data[0]):
                    while index + offs + now < len(hiragana) and data[0][index + i] != hiragana[offs + now]:
                        now += 1
                else:
                    now = len(hiragana) - index + offs
                kanji = "".join(data[0][index:index + i])
                tuzuri = "".join(hiragana[offs:offs + now])
                out = "<ruby>" + kanji + "<rp>（</rp><rt>" + tuzuri + "</rt><rp>）</rp></ruby>"
                print(out, end='')
                offs += now
                index += i
            else:
                print(data[0][index], end='')
                index += 1
                offs += 1
    else:
        print(data[0], end='')


