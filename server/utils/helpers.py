# utils/helpers.py
def to_dict(instance, fields):
    return {field: getattr(instance, field) for field in fields}


def valid_record_id(value):
    return type(value) is int and 0 < value <= 2_147_483_647
