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
        out = "<ruby>" + data[0] + "<rp>（</rp><rt>" + ja.kata2hira(data[8]) + "</rt><rp>）</rp></ruby>"
        print(out, end='')
    else:
        print(data[0], end='')


