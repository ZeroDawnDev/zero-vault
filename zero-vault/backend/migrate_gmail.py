from sqlalchemy import inspect, text

from database import engine


def migrate():
    inspector = inspect(engine)

    if "transactions" not in inspector.get_table_names():
        print("Transactions table does not exist yet.")
        print("Start the backend once to create the tables.")
        return

    columns = {
        column["name"]
        for column in inspector.get_columns("transactions")
    }

    migrations = {
        "gmail_message_id": (
            "ALTER TABLE transactions "
            "ADD COLUMN gmail_message_id VARCHAR(255)"
        ),
        "authorization_number": (
            "ALTER TABLE transactions "
            "ADD COLUMN authorization_number VARCHAR(100)"
        ),
        "status": (
            "ALTER TABLE transactions "
            "ADD COLUMN status VARCHAR(30) "
            "NOT NULL DEFAULT 'confirmed'"
        ),
    }

    with engine.begin() as connection:
        for column_name, sql in migrations.items():
            if column_name not in columns:
                connection.execute(text(sql))
                print(f"Added column: {column_name}")
            else:
                print(f"Column already exists: {column_name}")

        connection.execute(
            text(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS
                uq_transaction_gmail_message_id
                ON transactions (gmail_message_id)
                """
            )
        )

    print("Database migration completed.")


if __name__ == "__main__":
    migrate()