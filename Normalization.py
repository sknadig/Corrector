from flask import Blueprint, render_template, abort, request

from auth import edit_permission
from db import mongo

norm_page = Blueprint('norm_page', __name__, template_folder='templates')


@norm_page.route('<name>', defaults={'page': 1})
@norm_page.route('<name>/<int:page>')
@edit_permission.require()
def norm(name, page):
    coll = 'norm/' + name
    if coll in mongo.db.collection_names():
        corp = mongo.db[coll]
    else:
        return abort(404)

    item_num = mongo.db.corpora.find_one({'coll': coll})['num']

    if page > item_num or page < 1:
        return abort(404)

    item = corp.find_one({'id': page - 1})

    if not item:
        return abort(404)

    return render_template('norm.html', name=name, page=page, page_num=item_num, item=item)


@norm_page.route('<name>/saved', defaults={'page': 0})
@norm_page.route('<name>/saved/<int:page>')
@edit_permission.require()
def saved(name, page):
    coll = 'norm/' + name
    if coll in mongo.db.collection_names():
        corp = mongo.db[coll]
    else:
        return abort(404)

    item_num = mongo.db.corpora.find_one({'coll': coll})['num']

    if page >= item_num or page < 0:
        return abort(404)

    item = corp.find_one({'id': page})

    if not item:
        return abort(404)

    if 'corr' in item and item['corr']:
        return item['corr']
    else:
        return 'NIE ZAPISANO ZMIAN!'


@norm_page.route('<name>/modify', methods=['POST'])
@edit_permission.require()
def modify(name):
    coll = 'norm/' + name
    id = int(request.form['id'])
    value = request.form['value']
    if coll in mongo.db.collection_names():
        corp = mongo.db[coll]
    else:
        return abort(404)

    corp.update_one({'id': id}, {'$set': {'corr': value}})

    return ''


@norm_page.route('<name>/revert', methods=['POST'])
@edit_permission.require()
def revert(name):
    coll = 'norm/' + name
    id = int(request.form['id'])
    if coll in mongo.db.collection_names():
        corp = mongo.db[coll]
    else:
        return abort(404)

    corp.update_one({'id': id}, {'$set': {'corr': ''}})

    return ''


@norm_page.route('<name>/list')
@edit_permission.require()
def list(name):
    coll = 'norm/' + name
    if coll in mongo.db.collection_names():
        corp = mongo.db[coll]
    else:
        return abort(404)

    pages = []
    items = corp.find()
    for item in items:
        pages.append({'id': item['id'], 'modified': (len(item['corr']) > 0)})

    return render_template('norm_list.html', name=name, pages=pages)
