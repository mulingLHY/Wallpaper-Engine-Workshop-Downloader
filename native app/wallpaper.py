import struct
import sys
import threading
import json
import time
import zipfile
import os

if sys.platform == "win32":
  import os, msvcrt
  msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
  msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

def send_message(message):
  message = str(message)
  # Write message size.
  sys.stdout.buffer.write(struct.pack('=I', len(message.encode("utf-8"))))
  
  # Write the message itself.
  sys.stdout.buffer.write(struct.pack(str(len(message.encode("utf-8")))+"s", message.encode("utf-8")))
  sys.stdout.flush()

def read_thread_func():
  while True:
    try:
      # Read the message length (first 4 bytes).
      text_length_bytes = sys.stdin.buffer.read(4)
      # Unpack message length as 4 byte integer.
      if (sys.byteorder == 'big'):
        text_length = int.from_bytes(text_length_bytes, byteorder='big')
      else:
        text_length = int.from_bytes(text_length_bytes, byteorder='little')
      
      # Read the text (JSON object) of the message.
      text = sys.stdin.read(text_length)
      info = json.loads(text)
      extractProject(info['path'], info['id'])
    except Exception as e:
      send_message(e)

def extractProject(path, id):
  try:
    folder_abs = os.path.abspath('projects/myprojects/'+str(id))
    
    zip_file = zipfile.ZipFile(path)
    zip_list = zip_file.namelist() # 得到压缩包里所有文件

    for f in zip_list:
        zip_file.extract(f, folder_abs) # 循环解压文件到指定目录
    
    zip_file.close()
    send_message(json.dumps({"id":id,"success":1}))
  except Exception as e:
    send_message(json.dumps({"id":id, "success":0, "error":str(e)}))
  pass

def browserStart():
  send_message(json.dumps(sys.argv))
  thread = threading.Thread(target=read_thread_func)
  thread.daemon = True
  thread.start()

  while True:
    time.sleep(500) 
    pass

def userStart():
  while True:
    print(
"""
为浏览器插件添加自带解压支持
  1.edge
  2.google chrome
其他输入:退出
""")
    brow_num = input("输入序号: ")

    if brow_num != "1" and brow_num != "2": break

    if getattr(sys, 'frozen', False):
      native_app_path = sys.executable
    elif __file__:
      # py脚本模式，需要以bat启动
      native_app_path = os.path.join(parent_path,"wallpaper.bat")
      with open(native_app_path, 'w') as file_object:
        file_object.write("@echo off\n")
        file_object.write("python \""+self_path+"\" %*")

    # 写入chrome native app配置文件
    native_json_path = os.path.join(parent_path, "native.json")
    with open(native_json_path, 'w') as file_object:
      file_object.write(
"""
{
    "path": "%s", 
    "description": "Chrome Native Messaging Host",
    "name": "com.muling.wallpaper", 
    "type": "stdio", 
    "allowed_origins": [ 
      "chrome-extension://%s/" 
    ] 
} 
"""%(native_app_path.replace("\\","/"), chrome_id))
    
    # 写入注册表，注册chrome native app
    if brow_num == "1":
      os.system(r"""reg add "HKEY_CURRENT_USER\Software\Microsoft\Edge\NativeMessagingHosts\com.muling.wallpaper"  /d "%s" /f"""%native_json_path.replace("/","\\"))
    elif brow_num == "2":
      os.system(r"""reg add "HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.muling.wallpaper"  /d "%s" /f"""%native_json_path.replace("/","\\"))
    print("============================")
    pass

# 拓展id唯一对应私钥文件extension.pem，如果更换，需要修改此处
chrome_id = "gdkpmbijhndpigjpbljeeffhjkmicclf"

if getattr(sys, 'frozen', False):
  # pyinstaller打包后
  self_path = sys.executable
elif __file__:
  self_path = __file__
parent_path = os.path.dirname(self_path)


if len(sys.argv) > 2 and sys.argv[1].find(chrome_id) !=-1:
  browserStart()
else:
  userStart()
