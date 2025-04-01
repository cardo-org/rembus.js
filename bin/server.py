import http.server
import os
import ssl

keystore = os.environ.get("KEYSTORE", 
                          os.path.join(os.environ.get("HOME", "/tmp"),
                                        ".config",
                                        "rembus",
                                        "keystore"))

certfile = os.path.join(keystore, "rembus.crt")
keyfile = os.path.join(keystore, "rembus.key")

# Set the desired root directory
root_directory = ".."  # Replace with your desired path

# Change the current working directory
# os.chdir(root_directory)

server_address = ('', 8443)  # Use port 443 for HTTPS
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

httpd.socket = ssl.wrap_socket(httpd.socket,
                               server_side=True,
                               certfile=certfile,
                               keyfile=keyfile)

print("Serving HTTPS on port 8443...")
httpd.serve_forever()