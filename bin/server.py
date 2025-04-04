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

# Create an SSLContext
#context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)

# Create a socket
#sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Wrap the socket with SSL
#ssl_sock = context.wrap_socket(sock, server_hostname="your.server.com")



server_address = ('', 8443)  # Use port 443 for HTTPS
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
context.load_cert_chain(certfile=certfile, keyfile=keyfile)

# Wrap the HTTP server with SSL
httpd.socket = context.wrap_socket(httpd.socket, server_hostname='localhost')

#httpd.socket = ssl.wrap_socket(httpd.socket,
#                               server_side=True,
#                               certfile=certfile,
#                               keyfile=keyfile)

print("Serving HTTPS on port 8443...")
httpd.serve_forever()