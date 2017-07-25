all: clean zip

clean:
	rm builds/eyeson_app.zip || true

zip:
	zip -r builds/eyeson_app.zip . -i assets/* -i manifest.json -i translations/*
