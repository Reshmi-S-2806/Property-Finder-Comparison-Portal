import psycopg2

conn = psycopg2.connect(host="localhost", port=5433, user="postgres",
                        password="password", dbname="postgres")
conn.autocommit = True
conn.cursor().execute("CREATE DATABASE propertyfinder")
print("created")