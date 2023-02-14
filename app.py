from flask import Flask, request, jsonify, render_template
import spacy
from spacy import displacy
from werkzeug.utils import secure_filename
import boto3
import os
from flask_cors import CORS
from spacy.language import Language
from flaskext.markdown import Markdown

app = Flask(__name__)
Markdown(app)

CORS(app)
@Language.component("ingredients_rule")
def ingredients_rule(doc):
  new_ents=[]
  detected_entities=[]
  not_ing=[]
  other_entities=[]
  komposisi = False
  for ent in doc.ents:
    if ent.label_ == 'K-KEY':
        komposisi = True
    elif ent.label_ in ('HALAL', 'haram', 'syubhat') and (komposisi==True):
        detected_entities.append(ent)
    elif ent.label_ in ('HALAL', 'haram', 'syubhat') and  (komposisi!=True):
        not_ing.append(ent)
    elif ent.label_ == 'S-KEY':
        komposisi = False
    else:
        other_entities.append(ent)
  new_ents = detected_entities + other_entities
  doc.ents = new_ents
  return doc

UPLOAD_FOLDER = "static/uploads/"
RESULTS_FOLDER = "static/results/"
ALLOWED_EXTENSIONS = set(["png", "jpg", "jpeg"])


nlp = spacy.load("./models/v15.2")
HTML_WRAPPER = """<div style=" display: block; border-radius: 0.25rem; padding: 1rem; text-align: left;text-transform: capitalize; font-weight: 200;   justify-content: space-around;text-transform: lowercase; ">{}</div>"""


colors = {'HALAL': "#94d6c2", "HARAM": "#ed1a79", "SYUBHAT":"#ffc526"}
options = {"ents": ['HALAL', 'HARAM','SYUBHAT'], "colors": colors}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET"])
def upload_page():
    return render_template("index.html")

def detect_text(photo):
    client= boto3.client('textract',region_name=os.environ.get("REGION"), aws_access_key_id=os.environ.get("KUNCI_1"), aws_secret_access_key=os.environ.get("KUNCI_2"))
    with open(photo, 'rb') as image:
        response = client.detect_document_text(Document={'Bytes': image.read()})
    bahan=''
    textDetections=response['Blocks']

    for text in textDetections:
        if text['BlockType'] == 'LINE':
            bahan += text['Text']
            bahan += ' '

    return bahan

@app.route('/extract',methods=["GET","POST"])
def extract():
  if request.method == 'POST':
    raw_text = request.form['rawtext']
    result_image = request.form['image']
    print(raw_text)

    mystring = raw_text.lower()
    mystring = mystring.replace('\n', ' ').replace('\r', '')
    mystring = ' '.join(mystring.split())

    print(mystring)

    docx = nlp(mystring)
    html = displacy.render(docx,style="ent")
    html = html.replace("\n\n","\n")
    result = HTML_WRAPPER.format(html)
    detected_entities = []
    other_entities = []
    for ent in docx.ents:
        if ent.label_ in ('HALAL', 'haram', 'syubhat'):
            detected_entities.append({"name":ent.text ,"entities": ent.label_})
        else:
            other_entities.append({"name":ent.text ,"entities": ent.label_})
    print(detected_entities)

    return render_template('result.html',rawtext=raw_text,result=result,result_image=result_image,detected_entities=detected_entities,other_entities=other_entities)


@app.route('/api/extract',methods=["GET","POST"])
def api():
    if request.method == 'POST':
        if "file" not in request.files:
            return jsonify({"message":"select image png or jpg"})
        file = request.files["file"]
        # if no file is selected
        if file.filename == "":
            return jsonify({"message":"No file selected"})

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            print(filename)
            file.save(os.path.join("static/uploads", filename))
            text = detect_text(UPLOAD_FOLDER + filename);
            # raw_text = request.form['rawtext']

            mystring = text.replace('\n', ' ').replace('\r', '')
            mystring = mystring.lower()
            mystring = ' '.join(mystring.split())

            print(mystring)

            docx = nlp(mystring)
            html = displacy.render(docx,style="ent")
            html = html.replace("\n\n","\n")
            result = HTML_WRAPPER.format(html)
            detected_entities = []
            other_entities = []
            for ent in docx.ents:
                if ent.label_ in ('HALAL', 'haram', 'syubhat'):
                    detected_entities.append({"name":ent.text ,"entities": ent.label_})
                else:
                    other_entities.append({"name":ent.text ,"entities": ent.label_})
            print(detected_entities)
            return jsonify(
                        filename=filename,
                        result=result,
                        # result_image=result_image,
                        detected_entities=detected_entities,
                        other_entities=other_entities,
                        status=200
                    )

@app.route('/api/extracttext',methods=["GET","POST"])
def api_text():
    if request.method == 'POST':

        raw_text = request.form['rawtext']
        print(raw_text)

        mystring = raw_text.replace('\n', ' ').replace('\r', '')
        mystring = mystring.lower()
        mystring = ' '.join(mystring.split())

        print(mystring)

        docx = nlp(mystring)
        html = displacy.render(docx,style="ent")
        html = html.replace("\n\n","\n")
        result = HTML_WRAPPER.format(html)
        detected_entities = []
        other_entities = []
        for ent in docx.ents:
            if ent.label_ in ('HALAL', 'haram', 'syubhat'):
                detected_entities.append({"name":ent.text ,"entities": ent.label_})
            else:
                other_entities.append({"name":ent.text ,"entities": ent.label_})
        print(detected_entities)
        return jsonify(
                    detected_entities=detected_entities,
                    other_entities=other_entities,
                    status=200
                )

if __name__ == '__main__':
  app.run(debug=True)