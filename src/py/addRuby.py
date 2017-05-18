import sys
import subprocess
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        attr = " ".join(map(lambda x:x[0] + "=\"" + x[1] +"\"", attrs))
        print("<" + tag + " " + attr + ">")

    def handle_endtag(self, tag):
        print("</" + tag + ">")

    def handle_data(self, data):
        tagname = self.get_starttag_text()
        if tagname is not None and ("script" in tagname or "title" in tagname):
            print(data)
        else:
            output = subprocess.getoutput("echo " + "\"" +data + "\" | " + "../sh/appendruby.sh")
            print(output)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(self, tag, attrs)

    def handle_decl(self, decl):
        print("<!" +decl + ">")

parser = MyHTMLParser()

args = sys.argv
if len(args) > 1:
    f = open(args[1], "r")
    text = "".join(f.readlines())
    parser.feed(text)

