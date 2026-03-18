from app.services.emebdding_service import generate_embedding


def create_vector(house):
    description = house.get("description", "")
    house_id = house.get("id") or house.get("_id")

    embedding = generate_embedding(description)
    print("Create vector for:", house_id)


def update_vector(house):
    description = house.get("description", "")
    house_id = house.get("id") or house.get("_id")

    embedding = generate_embedding(description)
    print("Update vector for:", house_id)


def delete_vector(house_id):
    print("Delete vector:", house_id)