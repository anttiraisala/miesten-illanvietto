from PIL import Image, ImageDraw, ImageFont
W,H=32,46
SK="#e8b996"; SKS="#c98f6e"; SKH="#f2cdb0"
BLK="#15151b"; BLK2="#23232c"; EYE="#1c1218"; MOUTH="#a8504a"; WHITE="#f4f4f4"

def new(): return Image.new("RGBA",(W,H),(0,0,0,0))
def R(im,x0,y0,x1,y1,c):
    d=ImageDraw.Draw(im); d.rectangle([x0,y0,x1,y1],fill=c)
def P(im,pts,c):
    for x,y in pts: im.putpixel((x,y),Image.new("RGBA",(1,1),c).getpixel((0,0)))

def body(im,hw,print_=None):
    x0,x1=16-hw,15+hw
    R(im,x0,29,x1,45,BLK); R(im,x0+2,28,x1-2,28,BLK)
    R(im,x0,31,x0+1,45,BLK2); R(im,x1-1,31,x1,45,BLK2)   # sleeves shade
    R(im,13,27,18,29,SKS); R(im,14,29,17,30,SK)            # neck
    R(im,14,28,17,28,SKS)

def head(im,x0,x1):
    R(im,x0,13,x1,26,SK); R(im,x0+1,12,x1-1,12,SK); R(im,x0+2,27,x1-2,27,SK)
    R(im,x0,13,x0,13,SK)
    # ears
    R(im,x0-1,17,x0-1,20,SKS); R(im,x1+1,17,x1+1,20,SKS)
    # nose
    R(im,15,19,16,21,SKS); R(im,15,19,15,19,SK)

def eyes(im):
    P(im,[(12,17),(13,17),(18,17),(19,17)],EYE)

def glasses(im,x0,x1,col,lens=None,thick=1,bottom=None):
    for (a,b) in ((10,14),(17,21)):
        for t in range(thick):
            R(im,a+t,15+t,b-t,15+t,col)
            R(im,a+t,19-t,b-t,19-t,bottom or col)
            R(im,a+t,15,a+t,19,col); R(im,b-t,15,b-t,19,col)
    R(im,15,16,16,16,col)
    R(im,x0,16,9,16,col); R(im,22,16,x1,16,col)

def beard(im,x0,x1,c,g,full=True,sides=True):
    # sideburns + jaw
    if sides:
        R(im,x0,18,x0+1,26,c); R(im,x1-1,18,x1,26,c)
    R(im,x0+1,22,x1-1,26,c)
    R(im,x0+2,27,x1-2,27,c)
    # mustache
    R(im,12,21,19,21,c)
    # mouth hole
    R(im,14,22,17,23,MOUTH)
    # chin colour
    R(im,13,25,18,27,g); R(im,12,26,19,26,g)

def smile(im):
    R(im,13,22,18,23,WHITE); R(im,14,23,17,23,MOUTH); P(im,[(12,22),(19,22)],MOUTH)

def sheet(items,labels,path,scale=12):
    cols=len(items)
    pad=10
    cw,ch=W*scale,H*scale
    out=Image.new("RGB",(cols*(cw+pad)+pad,ch+60),"#1d2433")
    d=ImageDraw.Draw(out)
    try: f=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",22)
    except: f=ImageFont.load_default()
    for i,(im,l) in enumerate(zip(items,labels)):
        big=im.resize((cw,ch),Image.NEAREST)
        out.paste(big,(pad+i*(cw+pad),10),big)
        d.text((pad+i*(cw+pad)+8,ch+20),l,fill="#f2e6c9",font=f)
    out.save(path)

# ---------- RAUNO ----------
def rauno(hat=True):
    im=new(); body(im,9)
    R(im,10,36,21,43,"#b8842e"); R(im,12,34,19,35,"#b8842e"); R(im,13,38,18,41,"#e0b252")   # gold print
    R(im,11,37,12,37,BLK);R(im,19,40,20,40,BLK);R(im,14,43,17,43,BLK)
    if not hat:  # lanyard handled below too
        pass
    head(im,9,22)
    brown="#6b4a2c"
    beard(im,9,22,"#6e4b30","#b9b2a6")
    smile(im); eyes(im)
    glasses(im,8,23,"#8a4a24",thick=1)
    R(im,10,14,14,14,"#8a4a24"); R(im,17,14,21,14,"#8a4a24")
    R(im,10,20,14,20,"#8a4a24"); R(im,17,20,21,20,"#8a4a24")
    eyes(im)
    # lanyard
    for i in range(10): P(im,[(12+(i//2),29+i)],"#7cf04a"); P(im,[(19-(i//2),29+i)],"#7cf04a")
    P(im,[(16,40),(15,40),(16,41),(15,41)],"#3a7a2a")
    if hat:
        R(im,8,8,23,12,"#8a3d1e"); R(im,10,7,21,7,"#8a3d1e"); R(im,8,13,24,13,"#5e2813")
        R(im,22,12,25,13,"#5e2813")
        P(im,[(11,9),(14,10),(17,8),(20,10),(13,12),(19,12),(22,9),(9,11)],"#e8c9a0")
        P(im,[(12,8),(16,9),(21,11),(10,10)],"#c8581f")
        R(im,9,14,10,16,"#a8a39a"); R(im,21,14,22,16,"#a8a39a")  # gray at sides under cap
    else:
        R(im,9,10,22,13,brown); R(im,10,9,21,9,brown)
        P(im,[(10,8),(12,7),(13,8),(16,7),(18,8),(20,7),(21,8),(8,10),(7,12),(23,10),(24,9)],brown)
        P(im,[(12,10),(15,9),(18,11),(20,10),(11,12),(19,8)],"#c49a63")
        R(im,9,13,11,14,brown); R(im,20,13,22,14,brown)
    return im

# ---------- TUOMAS ----------
def tuomas():
    im=new(); body(im,11)
    # SOUTH EXPLORER text
    R(im,10,36,21,36,"#cfd2d6"); R(im,10,38,21,38,"#cfd2d6")
    for x in range(10,22,2): P(im,[(x,37)],"#cfd2d6")
    head(im,9,22)
    rb="#7a4528"; rb2="#8f5230"
    beard(im,9,22,rb,"#6b3c22")
    R(im,10,24,21,25,rb2); P(im,[(12,21),(19,21),(11,22),(20,22)],rb2)
    # relaxed smirk
    R(im,14,23,17,23,"#b0605a")
    eyes(im)
    for (x0_,x1_) in ((10,14),(17,21)):
        R(im,x0_,14,x1_,15,BLK); R(im,x0_,16,x0_,19,BLK); R(im,x1_,16,x1_,19,BLK)
        R(im,x0_+1,16,x1_-1,19,SKH); R(im,x0_,20,x1_,20,"#8fb08a")
    R(im,15,15,16,15,BLK); R(im,8,15,9,15,BLK); R(im,22,15,23,15,BLK)
    P(im,[(12,17),(13,17),(18,17),(19,17)],EYE)
    # hat
    R(im,10,5,21,11,BLK); R(im,11,4,20,4,BLK); R(im,10,10,21,10,"#34343e")
    R(im,5,12,26,13,BLK); R(im,7,14,24,14,BLK2); R(im,6,11,9,11,BLK); R(im,22,11,25,11,BLK)
    return im

# ---------- ANTTI ----------
def antti(cap=True):
    im=new(); body(im,13)
    hair="#2b2018"
    if cap:  # long hair behind
        R(im,6,14,9,31,hair); R(im,22,14,25,31,hair); R(im,7,12,24,13,hair)
    else:    # ponytail behind
        R(im,24,15,27,18,hair); R(im,25,19,27,27,hair); R(im,26,28,27,29,hair)
    head(im,8,23)
    dk="#3a2c24"
    R(im,9,21,22,26,dk); R(im,8,19,8,25,dk); R(im,23,19,23,25,dk)
    R(im,10,27,21,27,dk)
    R(im,11,22,20,22,"#4a3a30")          # upper-lip hair
    R(im,14,23,17,23,"#8f4a46")           # mouth
    R(im,13,25,18,27,"#9d9b95"); R(im,12,25,12,26,"#6a6762"); R(im,19,25,19,26,"#6a6762")
    R(im,14,28,17,28,"#9d9b95")           # goatee tip
    R(im,9,21,10,23,"#4f4540"); R(im,21,21,22,23,"#4f4540")
    # sceptical look: eyes heavy-lidded
    eyes(im)
    glasses(im,7,24,"#b9bcc6",thick=1)
    eyes(im)
    R(im,10,15,14,15,"#80838d"); R(im,17,15,21,15,"#80838d")  # brow bar
    # cheeks wider
    if cap:
        R(im,8,10,23,13,BLK); R(im,10,9,21,9,BLK); R(im,9,12,23,13,BLK)
        R(im,9,13,23,13,BLK2)
        R(im,8,13,9,13,hair);R(im,22,13,23,13,hair)
    else:
        R(im,9,10,22,13,hair); R(im,10,9,21,9,hair); R(im,8,12,9,17,hair); R(im,22,12,23,17,hair)
        R(im,15,9,16,9,"#4a3a2e")
        # parting line
        R(im,15,10,15,12,"#4a3a2e")
    return im

if __name__=="__main__":
    import sys
    import os
    out=sys.argv[1] if len(sys.argv)>1 else "assets/characters"
    os.makedirs(out,exist_ok=True)
    items=[rauno(True),rauno(False),tuomas(),antti(True),antti(False)]
    labels=["RAUNO (out)","RAUNO (in)","TUOMAS","ANTTI (out)","ANTTI (in)"]
    sheet(items,labels,out+"/characters.png")
    for n,i in zip(["rauno_out","rauno_in","tuomas","antti_out","antti_in"],items):
        i.resize((W*16,H*16),Image.NEAREST).save(f"{out}/{n}.png")
