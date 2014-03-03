import json
import os
import shutil
import zipfile

shutil.rmtree('bin', True)

bt = 'bin/tmp'
btc = bt + '/chrome'
btf = bt + '/firefox'
btfd = btf + '/data'
btfl = btf + '/lib'

os.makedirs(btc)
os.makedirs(btfd)
os.makedirs(btfl)

with open('common/common.json', 'r') as tmpIn:
    common = json.load(tmpIn)

with open('chrome/manifest.json', 'r') as tmpIn:
    tmpJson = json.load(tmpIn)
    tmpJson['name'] = common['name']
    tmpJson['short_name'] = common['short_name']
    tmpJson['description'] = common['description']
    tmpJson['version'] = common['version']
    with open(btc + '/manifest.json', 'w') as tmpOut:
        json.dump(tmpJson, tmpOut, ensure_ascii=False)

with open('firefox/package.json', 'r') as tmpIn:
    tmpJson = json.load(tmpIn)
    tmpJson['fullName'] = common['name']
    tmpJson['name'] = common['short_name'].lower()
    tmpJson['description'] = common['description']
    tmpJson['version'] = common['version']
    with open(btf + '/package.json', 'w') as tmpOut:
        json.dump(tmpJson, tmpOut, ensure_ascii=False)

with open('common/inject.js', 'r') as tmpIn:
    inject = tmpIn.read()

with open(btc + '/inject.js', 'w') as tmpOut:
    tmpOut.write(inject
        .replace('@@CSS@@', 'chrome.extension.getURL("battletag.css")')
        .replace('@@JS@@', 'chrome.extension.getURL("battletag.js")')
    )

with open(btfd + '/inject.js', 'w') as tmpOut:
    tmpOut.write(inject
        .replace('@@CSS@@', 'self.options.css')
        .replace('@@JS@@', 'self.options.js')
    )

shutil.copy('chrome/background.js', btc)
shutil.copy('common/battletag.js', btc)
shutil.copy('common/battletag.css', btc)
shutil.copy('images/icon-16.png', btc)
shutil.copy('images/icon-48.png', btc)
shutil.copy('images/icon-128.png', btc)

shutil.copy('firefox/main.js', btfl)
shutil.copy('common/battletag.js', btfd)
shutil.copy('common/battletag.css', btfd)
shutil.copy('images/icon-48.png', btfd)
shutil.copy('images/icon-64.png', btfd)

os.chdir(btc)

with zipfile.ZipFile('../../chrome.zip', 'w') as tmpZip:
    for root, dirs, files in os.walk('.'):
        for tmpFile in files:
            tmpZip.write(os.path.join(root, tmpFile))

os.chdir('..')

os.system('CALL "%PYTHON2%" "%CFX%" xpi --pkgdir=firefox')
shutil.move('battletag.xpi', '../firefox.xpi')
