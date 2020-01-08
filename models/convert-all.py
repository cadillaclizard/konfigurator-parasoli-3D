import os

files = os.listdir(os.curdir)

for file in files:
    name, ext = os.path.splitext(file)
    
    if (ext == ".obj"):
        os.system("convert_obj_three.py -i \"" + name + ".obj\" -o \"converted/" + name + ".json\"")

