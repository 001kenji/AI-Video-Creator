import datetime
def update_file(dataval, filename="output.txt"):
    """
    Appends the provided dataval to the file.
    If the file does not exist, it is created.

    Parameters:
        dataval: Data to be written to the file.
        filename (str): Name of the text file. Defaults to 'output.txt'.
    """
    # Open file in append mode; creates the file if it doesn't exist.
    with open(filename, "a") as file:
        # Write the data along with a newline for clarity.
        file.write(str(dataval) + "\n")


now = datetime.datetime.now()
short_date = now.strftime("%Y-%m-%dT%H:%M:%S")
update_file(short_date)